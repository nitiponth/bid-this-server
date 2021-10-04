import { User } from "../models/User";
import { Product } from "../models/Product";
import { Bid } from "../models/Bid";
import { Comment } from "../models/Comment";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import blacklist from "express-jwt-blacklist";

import { pubsub } from "../utils/pubsub";

const Mutation = {
  //User Mutation
  login: async (parent, { email, password }, ctx, info) => {
    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error("No user with this email");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Incorrect password");
    }

    const token = jwt.sign(
      { jti: user.id, id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const expired = jwt.decode(token).exp;

    return {
      token: token,
      user: user,
    };
  },
  logout: async (parent, args, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    await blacklist.revoke(userCtx, 3600);

    return "Logout Successfully.";
  },
  singup: async (parent, args, ctx, info) => {
    const {
      email,
      first,
      last,
      password,
      username,
      phone,
      address,
      province,
      postcode,
    } = args;

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      throw new Error("This email is already used.");
    }

    const usernameRegex = new RegExp(username, "i");
    const usernameExists = await User.findOne({
      username: { $regex: usernameRegex },
    });
    if (usernameExists) {
      throw new Error("This username is already used.");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    const hashedPasswword = await bcrypt.hash(password, 10);

    const user = new User({
      name: {
        first: first,
        last: last,
      },
      email: email.toLowerCase(),
      password: hashedPasswword,
      username: username,
      phone: phone,
      address: {
        home: address,
        province: province,
        postcode: postcode,
      },
      wallet: 0,
      status: "GUEST",
      role: "USER",
    });
    await user.save();

    pubsub.publish("USER_CREATED", {
      userCreated: user,
    });

    return "Signup has been successful.";
  },
  updateUser: async (parent, args, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const {
      first,
      last,
      username,
      address,
      province,
      postcode,
      desc,
      profile,
      cover,
      idCard,
      photo,
    } = args;

    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("User not found.");
    }

    if (typeof first === "string") {
      user.name.first = first;
    }

    if (typeof last === "string") {
      user.name.last = last;
    }

    if (typeof username === "string") {
      const regex = new RegExp(username, "i");
      const usernameTaken = await User.findOne({
        username: { $regex: regex },
      });
      if (usernameTaken) {
        throw new Error("This username has already been used.");
      }

      user.username = username;
    }

    // if (typeof phone === "string") {
    //   if (isNaN(phone)) {
    //     throw new Error("Phone number must be entered in numbers only.");
    //   }
    //   if (phone.length !== 10) {
    //     throw new Error("Phone number must be 10 digits.");
    //   }
    //   user.phone = phone;
    // }

    if (typeof address === "string") {
      user.address.home = address;
    }
    if (typeof province === "string") {
      user.address.province = province;
    }
    if (typeof postcode === "string") {
      if (isNaN(postcode)) {
        throw new Error("Postcode must be entered in numbers only.");
      }
      if (postcode.length !== 5) {
        throw new Error("Postcode must be 5 digits.");
      }
      user.address.postcode = postcode;
    }

    if (typeof desc === "string") {
      user.desc = desc;
    }

    if (typeof profile === "string") {
      if (profile === "") {
        user.profile = null;
      } else {
        user.profile = profile;
      }
    }
    if (typeof cover === "string") {
      if (cover === "") {
        user.cover = null;
      } else {
        user.cover = cover;
      }
    }
    if (typeof idCard === "string") {
      if (idCard === "") {
        user.kyc.idCard = null;
      } else {
        user.kyc.idCard = idCard;
      }
    }
    if (typeof photo === "string") {
      if (photo === "") {
        user.kyc.photo = null;
      } else {
        user.kyc.photo = photo;
      }
    }
    await user.save();

    return user;
  },
  addToWatchlists: async (parent, { productId }, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("User not found.");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("This product is not exists.");
    }

    const productIsActived = product.status === "ACTIVED";
    if (!productIsActived) {
      throw new Error("This product is not Actived.");
    }

    const productIdx = user.watchlists.indexOf(productId);
    if (productIdx == -1) {
      user.watchlists.push(productId);
    } else {
      user.watchlists.splice(productIdx, 1);
    }

    return await user.save();
  },
  depositCredit: async (parent, { value }, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }
    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("User not found.");
    }
    if (user.status === "BANNED") {
      throw new Error("User has been suspended.");
    }

    user.wallet = user.wallet + value;

    pubsub.publish(`WALLET_CHANGED ${userCtx.id}`, {
      walletChanged: user.wallet,
    });

    return await user.save();
  },
  withdrawCredit: async (parent, { value }, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }
    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("User not found.");
    }
    if (user.status === "BANNED") {
      throw new Error("User has been suspended.");
    }

    user.wallet = user.wallet + value;
    pubsub.publish(`WALLET_CHANGED ${userCtx.id}`, {
      walletChanged: user.wallet,
    });

    return await user.save();
  },

  //Product Mutation
  createProduct: async (parent, args, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const {
      category,
      title,
      condition,
      desc,
      start,
      initialPrice,
      bidOffer,
      images,
      shipping,
      policy,
    } = args;

    const creatorId = userCtx.id;

    const userExists = await User.findById(creatorId);
    if (!userExists) {
      throw new Error("User not found.");
    }

    const now = new Date();
    const limitTime = now.setHours(now.getHours() + 2);

    if (start < limitTime) {
      throw new Error(
        "The time must be set at least 2 hours from the current time."
      );
    }

    const endTime = new Date(start);
    endTime.setHours(endTime.getHours() + 1);

    const product = new Product({
      category: category,
      title: title,
      condition: condition,
      desc: desc,
      start: start,
      end: endTime,
      price: {
        initial: initialPrice,
        bidOffer: bidOffer,
      },
      images: images,
      shipping: shipping,
      policy: policy,
      seller: creatorId,
      status: "ACTIVED",
    });

    await product.save();

    pubsub.publish("PRODUCT_CREATED", {
      productCreated: product,
    });

    // userExists.products.push(product.id);
    // await userExists.save();

    console.log("created product: " + product.id);

    return product;
  },
  updateProduct: async (parent, args, { userCtx }, info) => {
    const {
      productId,
      category,
      title,
      condition,
      desc,
      start,
      initialPrice,
      bidOffer,
      images,
      shipping,
      policy,
    } = args;

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    if (product.seller.toString() !== userCtx.id.toString()) {
      throw new Error("Authorization failed");
    }
    if (product.status !== "ACTIVED") {
      throw new Error("Cant not edit on this product.");
    }
    if (product.price.current) {
      throw new Error(
        "The auction has started. Unable to edit product information"
      );
    }
    const currentTime = new Date();
    currentTime.setHours(currentTime.getHours() + 1);
    if (product.start < currentTime) {
      throw new Error(
        "The auction time cannot be modified 1 hour before the auction time."
      );
    }
    if (typeof category === "string") {
      product.category = category;
    }
    if (typeof title === "string" && title.trim() !== "") {
      product.title = title;
    }
    if (typeof condition === "string") {
      product.condition = condition;
    }
    if (typeof desc === "string") {
      product.desc = desc;
    }

    if (start !== null) {
      if (start < currentTime) {
        throw new Error(
          "The auction time must be adjusted at least 1 hour before the auction starts."
        );
      }

      product.start = start;
      const endTime = new Date(start);
      endTime.setHours(endTime.getHours() + 1);
      product.end = endTime;
    }

    if (typeof initialPrice === "number") {
      product.price.initial = initialPrice;
    }
    if (typeof bidOffer === "number") {
      product.price.bidOffer = bidOffer;
    }
    if (images !== null) {
      product.images = images;
    }
    if (typeof shipping === "string") {
      product.shipping = shipping;
    }
    if (policy !== null) {
      product.policy = policy;
    }

    console.log(`productId: ${product.id} is updated.`);

    return await product.save();
  },
  deleteProduct: async (parent, { productId }, { userCtx }, info) => {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found.");
    }
    if (userCtx.id.toString() !== product.seller.toString()) {
      throw new Error("Not authorized to delete this product");
    }
    if (product.start < new Date()) {
      throw new Error("The auction has started. Unable to delete product.");
    }
    await Product.deleteOne({ _id: productId });
    return "Product deleted successfully.";
  },
  adminUpdateProduct: async (parent, args, { userCtx }, info) => {
    const { productId, title, desc, initialPrice, start, end, status } = args;

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    product.end = end;

    return await product.save();
  },

  // Bid Mutation
  placeBid: async (parent, { productId, bidPrice }, { userCtx }, info) => {
    //Actived check
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    if (product.status !== "ACTIVED") {
      throw new Error("Product is not active for bid.");
    }

    //Time check
    const currentTime = new Date();
    if (product.end < currentTime) {
      throw new Error("This auction has ended.");
    }

    //Price check
    if (bidPrice < product.price.initial || bidPrice <= product.price.current) {
      throw new Error(
        "Can't offer a price lower than the reserve or current price."
      );
    }

    //Wallet Check
    let bidInfo;
    if (product.price.current) {
      bidInfo = await Bid.find({ product: productId }).sort({
        bidTime: -1,
      });
    }

    //Check wallet values
    const user = await User.findById(userCtx.id);
    if (product.price.current && bidInfo[0].bidder.toString() === userCtx.id) {
      //bidder is the same one with old bidder
      if (user.wallet + bidInfo[0].bidPrice < bidPrice) {
        throw new Error("Your balance is not enough to bid.");
      }
    } else {
      //bidder is NOT the same one with old bidder
      if (user.wallet < bidPrice) {
        throw new Error("Your balance is not enough to bid.");
      }
    }

    //refund old bidder money if not a first bit
    if (product.price.current) {
      const oldBidder = await User.findById(bidInfo[0].bidder);
      oldBidder.wallet = oldBidder.wallet + bidInfo[0].bidPrice;
      await oldBidder.save();
      pubsub.publish(`WALLET_CHANGED ${oldBidder.id}`, {
        walletChanged: oldBidder.wallet,
      });
    }

    //pay for new bid
    const payUser = await User.findById(userCtx.id);
    payUser.wallet = payUser.wallet - bidPrice;
    await payUser.save();

    pubsub.publish(`WALLET_CHANGED ${payUser.id}`, {
      walletChanged: payUser.wallet,
    });

    //create new bid infomation
    const newBidInfo = new Bid({
      product: productId,
      bidPrice: bidPrice,
      bidder: userCtx.id,
      bidTime: currentTime,
    });

    await newBidInfo.save();

    //update product's current price
    product.price.current = bidPrice;
    product.buyer = payUser.id;

    //update end time
    const timeDiff = product.end - currentTime;
    //timeDiff < 5m
    if (timeDiff < 300000) {
      //product.end = product.end + 15m
      const endTime = currentTime;
      endTime.setMinutes(endTime.getMinutes() + 15);
      product.end = endTime;
    }

    await product.save();

    pubsub.publish(`BID_PLACED ${productId}`, {
      bidPlaced: { product: product, bidInfo: newBidInfo },
    });
    pubsub.publish(`PRODUCTS_CHANGED`, {
      productsChanged: "Bid placed in products",
    });

    return newBidInfo;
  },

  // Comment mutaiton
  createComment: async (parent, args, { userCtx }, info) => {
    const { productId, body, score } = args;

    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found.");
    }

    //Auction end check
    if (product.end > new Date()) {
      throw new Error("The auction is not over yet.");
    }

    if (!product.price.current) {
      throw new Error("No user bids for this item.");
    }

    if (!product.buyer) {
      const bidInfo = await Bid.find({ product: product.id }).sort({
        bidTime: -1,
      });
      const buyer = await User.findById(bidInfo[0].bidder.toString());
      product.buyer = buyer;
      await product.save();
    }

    if (product.buyer.toString() != userCtx.id.toString()) {
      throw new Error(
        "Only the buyer has the right to comment on this product."
      );
    }

    let comment = await Comment.findOne({ product: productId });
    if (!comment) {
      comment = new Comment({
        product: productId,
        body: body,
        score: score,
        buyer: product.buyer,
      });
    } else {
      if (typeof body === "string") {
        comment.body = body;
      }
      if (typeof score === "number") {
        comment.score = score;
      }
    }

    return await comment.save();
  },
};

export default Mutation;
