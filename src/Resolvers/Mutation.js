import { User } from "../models/User";
import { Product } from "../models/Product";
import { Bid } from "../models/Bid";
import { Comment } from "../models/Comment";
import { Transaction } from "../models/Transaction";
import { ReportedUser } from "../models/ReportedUser";
import { ReportedProduct } from "../models/ReportedProduct";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import blacklist from "express-jwt-blacklist";

import { pubsub } from "../utils/pubsub";

import {
  retrieveCustomer,
  createCustomer,
  createCharge,
  createRecipient,
  retrieveRecipient,
  createTransfer,
  retrieveTransaction,
  createToken,
  destroyCard,
  destroyRecipient,
} from "../utils/omiseUtils";
import { sendEmailVerification } from "../functions/sendEmailVerification";
import { sendNotificaitons } from "../functions/sendNotifications";
import Notification from "../models/Notification";

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

    const otp = Math.floor(100000 + Math.random() * 900000);
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1);

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
      profile:
        "https://bid-this-storage.s3.ap-southeast-1.amazonaws.com/profile/no-profile-2.png",
      wallet: 0,
      status: "GUEST",
      role: "USER",
      otp: otp,
      exp_otp: nextHour,
    });
    await user.save();

    await sendEmailVerification({ email, otp });

    pubsub.publish("USER_CREATED", {
      userCreated: user,
    });

    console.log(`user ${email} created account successfully.s`);
    return "Signup has been successful.";
  },

  verifyEmail: async (parent, { otp }, { userCtx }, info) => {
    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("You are not authenticated!");
    }

    if (user.status === "FULLAUTHEN" || user.status === "AUTHEN") {
      throw new Error("This user has already received an email confirmation.");
    }

    if (user.status === "BANNED") {
      throw new Error("This user has been banned, please contact admin.");
    }

    const otpInDB = user.otp;
    const expiredTime = user.exp_otp;

    const now = new Date();
    if (now > expiredTime) {
      throw new Error("Your OTP has expired.");
    }

    if (otp !== otpInDB) {
      throw new Error("Your OTP is invalid.");
    }

    user.status = "AUTHEN";

    await user.save();

    console.log(`${user.id} is verificated email successfully.`);

    return "Email verificated.";
  },

  getNewEmailVerification: async (parent, args, { userCtx }, info) => {
    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("You are not authenticated!");
    }

    if (user.status === "FULLAUTHEN" || user.status === "AUTHEN") {
      throw new Error("This user has already received an email confirmation.");
    }

    if (user.status === "BANNED") {
      throw new Error("This user has been banned, please contact admin.");
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000);
    const email = user.email;

    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1);

    user.otp = newOtp;
    user.exp_otp = nextHour;

    await user.save();

    const result = await sendEmailVerification({ email, otp: newOtp });
    if (!result) {
      throw new Error("Send email failed, Please contact our admin.");
    }

    console.log(`send new OTP to ${user.id} successfully.`);

    return "send new otp successfully.";
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

      if (username.trim() === "") {
        throw new Error("Username can not be space.");
      }

      if (username.trim().toLocaleLowerCase().includes("admin")) {
        throw new Error("Username not allow to includes word like admin.");
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
  addToWatchlists: async (parent, { watchedArr }, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("User not found.");
    }

    user.watchlists = watchedArr;

    console.log(user.username, user.watchlists);

    return await user.save();
  },

  toggleFollowing: async (parent, { userArr }, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("User not found.");
    }

    // const targetUser = await User.findById(userId);
    // if (!targetUser) {
    //   throw new Error("User not found.");
    // }

    user.following = userArr;

    // const userIdx = user.following.indexOf(userId);
    // if (userIdx === -1) {
    //   followingList.push(userId);
    // } else {
    //   followingList.splice(userIdx, 1);
    //   console.log(`user ${userCtx.id} unfollow ${userId}`);
    // }

    await user.save();
    console.log(
      `update user ${userCtx.id} following to ${userArr.length} users`
    );

    return user;
  },

  depositCredit: async (
    parent,
    { cardId, paymentInfo, save, amount },
    { userCtx },
    info
  ) => {
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

    let customer;

    //customer use exist card
    if (cardId) {
      const cust = await retrieveCustomer(cardId);
      if (!cust) {
        throw new Error("Can not process payment with this card.");
      }

      customer = cust;
    }

    //customer use new card
    if (paymentInfo) {
      // const userFullname = user.name.first + " " + user.name.last;

      //create token
      const { card, name, expMonth, expYear, cvc } = paymentInfo;

      const newToken = await createToken(name, card, expMonth, expYear, cvc);
      if (!newToken) {
        throw new Error("Can not create token, please try again.");
      }

      const newCustomer = await createCustomer(user.email, name, newToken.id);
      if (!newCustomer) {
        throw new Error("Can not process payment, please try again.");
      }
      customer = newCustomer;

      const { id, expiration_month, expiration_year, brand, last_digits } =
        newCustomer.cards.data[0];

      if (save) {
        user.cards.push({
          id: newCustomer.id,
          cardInfo: {
            id,
            expiration_month,
            expiration_year,
            brand,
            last_digits,
          },
        });

        await user.save();
      }
    }

    const charge = await createCharge(amount * 100, customer.id);
    if (!charge) {
      throw new Error("Something went wrong with payment, please try again.");
    }

    const transaction = new Transaction({
      tranId: charge.id,
      user: user.id,
      amount: amount,
      type: "DEPOSIT",
      status: true,
    });

    const res = await transaction.save();

    user.wallet = user.wallet + amount;

    pubsub.publish(`WALLET_CHANGED ${userCtx.id}`, {
      walletChanged: user.wallet,
    });

    await user.save();

    console.log(`user ${user.id} deposit ${amount} successfully.`);

    return res;
  },

  //account
  createRep: async (parent, { name, brand, number }, { userCtx }, info) => {
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

    let recipient;
    recipient = await createRecipient(name, user.email, brand, number);

    if (!recipient) {
      throw new Error("Create Recipient Error.");
    }

    user.bankAccounts.push({
      id: recipient.id,
      bankInfo: {
        id: recipient.id,
        brand: recipient.bank_account.bank_code,
        last_digits: recipient.bank_account.last_digits,
        name: recipient.bank_account.name,
        active: recipient.active,
      },
    });

    await user.save();

    return "adding book account successfully.";
  },
  updateRepActive: async (parent, args, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }
    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("User not found.");
    }
    if (user.bankAccounts.length === 0) {
      return "No bank account for update";
    }

    const bankAccs = user.bankAccounts;
    let isUpdated = false;

    for (const [idx, bankData] of bankAccs.entries()) {
      if (bankData.bankInfo.active) {
        continue;
      }
      const data = await retrieveRecipient(bankData.id);
      if (data && data.active) {
        user.bankAccounts[idx].bankInfo.active = true;
        isUpdated = true;
      }
    }
    if (!isUpdated) {
      return 100;
    }

    await user.save();
    return 200;
  },
  withdrawCredit: async (parent, { bankId, amount }, { userCtx }, info) => {
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

    if (amount > user.wallet) {
      throw new Error("User balance is insufficient.");
    }

    let bankAccount;
    bankAccount = await retrieveRecipient(bankId);
    if (!bankAccount) {
      throw new Error("Bank account not found, Please check the correctness.");
    }

    const transfer = await createTransfer(amount * 100, bankId);
    if (!transfer) {
      throw new Error("Someting went wrong with transfer, Please try agian.");
    }

    const transaction = new Transaction({
      tranId: transfer.id,
      user: user.id,
      amount: amount,
      type: "WITHDRAW",
      status: transfer.sent,
    });

    const res = await transaction.save();

    user.wallet = user.wallet - amount;
    await user.save();
    pubsub.publish(`WALLET_CHANGED ${userCtx.id}`, {
      walletChanged: user.wallet,
    });

    return res;
  },

  removeCard: async (parent, { custId }, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("User not found.");
    }

    const customer = user.cards.find((card) => card.id === custId);
    if (!customer) {
      throw new Error("Customer ID not found.");
    }

    const result = await destroyCard(customer.id, customer.cardInfo.id);

    if (result) {
      console.log(`destroy card of customer ${customer.id}.`);
    } else {
      throw new Error("Destroy card failed. Please contact admin.");
    }

    const updatedCardsArray = user.cards.filter((card) => card.id !== custId);

    user.cards = updatedCardsArray;
    await user.save();

    return "done.";
  },

  removeRecipient: async (parent, { reptId }, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("User not found.");
    }

    const recipient = user.bankAccounts.find((rept) => rept.id === reptId);
    if (!recipient) {
      throw new Error("Recipient not found.");
    }

    const result = await destroyRecipient(recipient.id);

    if (result) {
      console.log(`destroy recipient ID ${recipient.id}.`);
    } else {
      throw new Error("Destroy recipient failed. Please contact admin.");
    }

    const updatedReptArray = user.bankAccounts.filter(
      (rept) => rept.id !== reptId
    );

    user.bankAccounts = updatedReptArray;
    await user.save();

    return "done.";
  },

  reportUser: async (parent, { userId, body }, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found!");
    }

    const reportedUser = new ReportedUser({
      user: user.id,
      reportBy: userCtx.id,
      body: body,
      reportStatus: "RECEIVED",
    });

    await reportedUser.save();

    console.log(
      `user ID: ${reportedUser.user} reported by ${reportedUser.reportBy}`
    );

    return "The request has been received.";
  },

  //Admin User Mutation
  adminChangeUserStatus: async (
    parent,
    { userId, newStatus },
    { userCtx },
    info
  ) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const admin = await User.findById(userCtx.id);
    if (!admin) {
      throw new Error("User not found!");
    }
    if (admin.role !== "ADMIN") {
      throw new Error("You are not Unauthorized.");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found!");
    }

    user.status = newStatus;
    await user.save();

    return user;
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

    const createdProduct = await product.save();

    pubsub.publish("PRODUCT_CREATED", {
      productCreated: createdProduct,
    });

    console.log("created product: " + product.id);

    const follower = await User.find({
      following: userCtx.id,
    });

    const tickets = follower.map((user) => {
      const { id: targetId } = user;

      const message = `${userExists.username} put ${createdProduct.title} up for auction, see product details now! `;

      return sendNotificaitons({
        sellerId: userExists.id,
        productId: createdProduct.id,
        targetId,
        message,
      });
    });

    await Promise.all(tickets);

    return product;
  },

  // testNotification: async (parent, args, { userCtx }, info) => {
  //   const follower = await User.find({
  //     following: userCtx.id,
  //   });

  //   const tickets = follower.map((user) => {
  //     const { id } = user;

  //     return sendNotificaitons({
  //       sellerId: userExists.id,
  //       productId: createdProduct.id,
  //       productTitle: createdProduct.title,
  //       targetId: id,
  //       username: userExists.username,
  //     });
  //   });

  //   await Promise.all(tickets);

  //   return "done.";
  // },

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
  updateProductTrack: async (
    parent,
    { productId, track },
    { userCtx },
    info
  ) => {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found.");
    }
    if (userCtx.id.toString() !== product.seller.toString()) {
      throw new Error("Not authorized updated this product.");
    }
    if (product.end >= new Date()) {
      throw new Error("This auction is not over yet.");
    }
    if (!product.buyer) {
      throw new Error("There are no bidders for this product.");
    }
    if (track.length <= 5) {
      throw new Error("tracking number is invalid");
    }

    const current = new Date();

    product.track = track;
    product.sentAt = current;

    const result = await product.save();

    return result;
  },
  deleteProduct: async (parent, { productId }, { userCtx }, info) => {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found.");
    }
    if (userCtx.id.toString() !== product.seller.toString()) {
      throw new Error("Not authorized to delete this product.");
    }
    if (product.start < new Date()) {
      throw new Error("The auction has started. Unable to delete product.");
    }
    await Product.deleteOne({ _id: productId });
    return "Product deleted successfully.";
  },
  confirmProduct: async (parent, { productId }, { userCtx }, info) => {
    //Customer confirm when recieve product.
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found.");
    }
    if (product.status !== "ACTIVED") {
      throw new Error(
        "Can not confirm on this product. Please contact support for help."
      );
    }
    if (product.end > new Date()) {
      throw new Error("This auction is not over yet.");
    }
    if (userCtx.id.toString() !== product.buyer.toString()) {
      throw new Error("Not authorized to confirm this product.");
    }

    product.status = "RECEIVED";

    const result = await product.save();

    const transaction = new Transaction({
      user: userCtx.id,
      amount: product.price.current,
      type: "BUY",
      status: true,
      product: product.id,
    });

    const transResult = await transaction.save();
    if (!transResult) {
      throw new Error("Create transaction failed.");
    }

    const seller = await User.findById(product.seller);
    seller.wallet = seller.wallet + product.price.current;
    await seller.save();

    const sellerTransaction = new Transaction({
      user: product.seller,
      amount: product.price.current,
      type: "SELL",
      status: true,
      product: product.id,
    });

    const tranSellResult = await sellerTransaction.save();
    if (!tranSellResult) {
      throw new Error("Create seller transaction failed.");
    }

    pubsub.publish(`WALLET_CHANGED ${seller.id}`, {
      walletChanged: seller.wallet,
    });

    return result;
  },

  reportProduct: async (parent, { productId, body }, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("User not found!");
    }

    const reportedProduct = new ReportedProduct({
      product: product.id,
      reportBy: userCtx.id,
      body: body,
      reportStatus: "RECEIVED",
    });

    await reportedProduct.save();

    console.log(
      `Product ID: ${reportedProduct.product} reported by ${reportedProduct.reportBy}`
    );

    return "The request has been received.";
  },

  refundProduct: async (parent, { productId }, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("User not found");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.buyer.toString() !== user.id.toString()) {
      throw new Error("You are Unauthorized.");
    }

    if (product.status !== "ACTIVED") {
      throw new Error(
        `Somethings went wrong. Please contact our admin with this productId ${product.id}`
      );
    }

    const now = new Date();

    if (product.end > now) {
      throw new Error("The auction for this item is not over yet.");
    }

    const limitDays = new Date(product.end);
    if (product.extendTime) {
      limitDays.setDate(limitDays.getDate() + 14);
    } else {
      limitDays.setDate(limitDays.getDate() + 7);
    }

    if (now < limitDays) {
      throw new Error("This product has not expired for delivery.");
    }

    const refundCredits = product.price.current;

    user.wallet = user.wallet + refundCredits;

    product.status = "REFUNDED";

    await product.save();
    await user.save();

    pubsub.publish(`WALLET_CHANGED ${userCtx.id}`, {
      walletChanged: user.wallet,
    });

    console.log(
      `user ${user.id} refund product ${product.id} for ${refundCredits}฿`
    );

    return "Done.";
  },

  extendDeliveryTime: async (parent, { productId }, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("User not found.");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found.");
    }

    const now = new Date();

    if (product.end > now) {
      throw new Error("The auction for this item is not over yet.");
    }

    if (product.buyer.toString() !== user.id.toString()) {
      throw new Error("You are Unauthorized.");
    }

    if (product.extendTime) {
      throw new Error("This product alreary extend delivery time.");
    }

    product.extendTime = true;

    await product.save();

    console.log(
      `user ${user.id} extend delivery time of product ${product.id}`
    );

    return "Done.";
  },

  //admin Product mutation
  adminUpdateProduct: async (parent, args, { userCtx }, info) => {
    const { productId, title, desc, initialPrice, start, end, status } = args;

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    product.end = end;

    return await product.save();
  },

  adminDeactiveProduct: async (parent, { productId }, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("User not found.");
    }
    if (user.role !== "ADMIN") {
      throw new Error("You are Unauthorized");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found.");
    }

    if (new Date().toISOString() > new Date(product.start).toISOString()) {
      //refund last bid

      //or define to can't change status
      throw new Error(
        "This product has already begun bidding. Can not change status"
      );
    }

    product.status = "BANNED";
    await product.save();

    return product;
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

    if (product.start > currentTime) {
      throw new Error("This auction has not start yet.");
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

      const message = `Someone placed a higher bid than you. Let go check it! `;

      sendNotificaitons({
        sellerId: product.seller,
        productId: product.id,
        targetId: oldBidder.id,
        message,
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
    //timeDiff < 10m
    if (timeDiff < 600000) {
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
    const { productId, body, score, rImages } = args;

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
        rImages: rImages,
        buyer: product.buyer,
      });
    } else {
      if (typeof body === "string") {
        comment.body = body;
      }
      if (typeof score === "number") {
        comment.score = score;
      }
      if (images !== null || images.length !== 0) {
        comment.rImages = rImages;
      }
    }

    return await comment.save();
  },

  // Transaction Query
  updateAndGetTransactions: async (parent, args, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }
    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("User not found.");
    }
    const transactions = await Transaction.find({ user: userCtx.id });

    if (transactions.length === 0) {
      return transactions;
    }

    for (const [idx, transaction] of transactions.entries()) {
      if (transaction.status || transaction.type !== "WITHDRAW") {
        continue;
      }

      const data = await retrieveTransaction(transaction.tranId);
      if (data && data.sent && data.paid) {
        transaction.status = data.sent;
        await transaction.save();
      }
    }

    return transactions;
  },

  // Admin Report Mutation
  updateReportStatus: async (
    parent,
    { reportId, type, newStatus },
    { userCtx },
    info
  ) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }
    const user = await User.findById(userCtx.id);
    if (!user) {
      throw new Error("You are unauthorized.");
    }

    if (user.role !== "ADMIN") {
      throw new Error("You are unauthorized.");
    }

    let reportData;

    if (type === "User") {
      reportData = await ReportedUser.findById(reportId);
    } else if (type === "Product") {
      reportData = await ReportedProduct.findById(reportId);
    }

    if (!reportData) {
      throw new Error("Report not found");
    }

    reportData.reportStatus = newStatus;

    await reportData.save();

    console.log(`update report ${reportData.id} sucessfully.`);

    return "Done.";
  },

  seenNotification: async (parent, { notiId }, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    await Notification.findOneAndUpdate(
      {
        _id: notiId,
        target: userCtx.id,
      },
      { seen: true }
    );

    return "Done.";
  },
};

export default Mutation;
