import { User } from "../models/User";
import { Product } from "../models/Product";
import { Bid } from "../models/Bid";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import blacklist from "express-jwt-blacklist";

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
    return token;
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
    return user;
  },
  updateUser: async (parent, args, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const { first, last, username, phone, address, province, postcode } = args;

    const user = await User.findById(userCtx.id).exec();
    if (user === null) {
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

    if (typeof phone === "string") {
      if (isNaN(phone)) {
        throw new Error("Phone number must be entered in numbers only.");
      }
      if (phone.length !== 10) {
        throw new Error("Phone number must be 10 digits.");
      }
      user.phone = phone;
    }

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

    await user.save();

    return user;
  },
  addWatch: async (parent, { productId }, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("This product is not exists.");
    }

    const productIsActived = product.status === "ACTIVED";
    if (!productIsActived) {
      throw new Error("This product is not Actived.");
    }

    userCtx.watchlists.push(productId);

    return await userCtx.save();
  },

  //Product Mutation
  createProduct: async (parent, args, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const { title, desc, initialPrice, start, status } = args;

    const creatorId = userCtx.id;

    const userExists = await User.findById(creatorId);
    if (!userExists) {
      throw new Error("User not found.");
    }

    const now = new Date();
    const limitTime = now.setHours(now.getHours() + 2);

    if (start < limitTime) {
      throw new Error(
        "The timer must be set at least 2 hours from the current time."
      );
    }

    const endTime = new Date(start);
    endTime.setHours(endTime.getHours() + 1);

    const product = new Product({
      title: title,
      desc: desc,
      price: {
        initial: initialPrice,
      },
      seller: creatorId,
      start: start,
      end: endTime,
      status: status,
    });

    await product.save();

    // userExists.products.push(product.id);
    // await userExists.save();

    return product;
  },

  // Bid Mutation
  placeBid: async (parent, { productId, bidPrice }, { userCtx }, info) => {
    //Price check
    const product = await Product.findById(productId);
    if (bidPrice < product.price.initial || bidPrice <= product.price.current) {
      throw new Error(
        "Can't offer a price lower than the reserve or current price."
      );
    }

    //Wallet Check
    const bidInfo = await Bid.find({ productId: productId }).sort({
      bidTime: -1,
    });

    const user = await User.findById(userCtx.id);
    if (bidInfo[0].bidder.toString() === userCtx.id) {
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
    }

    //pay for new bid
    const payUser = await User.findById(userCtx.id);
    payUser.wallet = payUser.wallet - bidPrice;
    await payUser.save();

    //create new bid infomation
    const newBidInfo = new Bid({
      productId: productId,
      bidPrice: bidPrice,
      bidder: userCtx.id,
      bidTime: new Date(),
    });
    await newBidInfo.save();

    //update product's current price
    product.price.current = bidPrice;
    await product.save();

    return newBidInfo;
  },
};

export default Mutation;
