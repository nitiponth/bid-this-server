import { User } from "../models/User";
import { Product } from "../models/Product";
import { Comment } from "../models/Comment";
import { Transaction } from "../models/Transaction";
import { ReportedUser } from "../models/ReportedUser";
import { ReportedProduct } from "../models/ReportedProduct";
import mongoose from "mongoose";
import { getNotificationsWithPage } from "../functions/getNotificationsWithPage";

const Query = {
  hello: () => "hello",
  currentNumber: () => currentNumber,

  //User Query
  me: async (parent, args, { userCtx }, info) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    return await User.findById(userCtx.id);
  },
  getUsers: async (parent, args, ctx, info) => {
    if (!args.username) {
      const users = await User.find();
      return users;
    } else {
      const username = args.username;
      const regex = new RegExp(username, "i");
      const users = await User.find({ username: { $regex: regex } });
      if (!users) {
        throw new Error("User not found.");
      }
      return users;
    }
  },
  getUserById: async (parent, { userId }, ctx, info) => {
    if (!userId) {
      throw new Error("Syntax Error! Need userId.");
    } else {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    }
  },
  getOneUser: async (parent, args, ctx, info) => {
    if (!args.username) {
      throw new Error("Syntax Error!");
    } else {
      const username = args.username;
      const regex = new RegExp(username, "i");
      const user = await User.findOne({ username: { $regex: regex } });
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    }
  },

  //Product Query
  getProducts: async (parent, args, ctx, info) => {
    const { title } = args;
    if (title) {
      const products = await Product.find();
      return products;
    }

    const regex = new RegExp(title, "i");
    const products = await Product.find({ title: { $regex: regex } });
    if (!products) {
      throw new Error("Product not found.");
    }
    return products;
  },
  getActivedProducts: async (parent, args, ctx, info) => {
    const currentTime = new Date();

    const products = await Product.aggregate([
      {
        $match: {
          end: {
            $gte: currentTime,
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: {
          path: "$seller",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              { $ne: ["$seller.status", "BANNED"] },
              { $eq: ["$status", "ACTIVED"] },
            ],
          },
        },
      },
      {
        $addFields: {
          id: "$_id",
        },
      },
    ]);

    if (!products) {
      throw new Error("Product not found.");
    }

    return products;
  },
  getProductById: async (parent, args, ctx, info) => {
    const { productId } = args;
    if (!mongoose.isValidObjectId(productId)) {
      throw new Error("Product ID is invalid.");
    }
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  },
  getOneProduct: async (parent, args, ctx, info) => {
    const { title } = args;
    const regex = new RegExp(title, "i");
    const product = await Product.findOne({ title: { $regex: regex } });
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  },
  getProductsByUserId: async (parent, { userId, filter }, ctx, info) => {
    const currentTime = new Date().toLocaleString("en-Us");
    let products;
    if (!filter) {
      products = await Product.find({
        // start: { $lt: currentTime },
        end: { $gte: currentTime },
        seller: userId,
      });
    }

    if (filter === "AUCTIONED") {
      products = await Product.find({
        end: { $lte: currentTime },
        seller: userId,
      });
    }

    if (filter === "BIDDED") {
      products = await Product.find({
        end: { $lte: currentTime },
        buyer: userId,
      });
    }

    if (!products) {
      throw new Error("Product not found.");
    }
    return products;
  },

  // Comment Query
  getComments: async (parent, { productId }, ctx, info) => {
    const comments = await Comment.findOne({ product: productId });
    return comments;
  },

  // Transaction Query
  getTransactionsByUserId: async (
    parent,
    { offset = 0, limit = 10 },
    { userCtx },
    info
  ) => {
    const transCount = Transaction.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userCtx.id),
        },
      },
      { $count: "count" },
    ]);

    const transactions = Transaction.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: {
          user: mongoose.Types.ObjectId(userCtx.id),
        },
      },
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
    ]);

    const promResult = await Promise.all([transCount, transactions]);

    const result = {
      data: promResult[1],
      metadata: {
        count: promResult[0][0].count || 0,
        current: offset + limit,
        limit,
        offset,
      },
    };

    return result;
  },

  // Report Query
  getReportedUsers: async (parent, args, ctx, info) => {
    const reportedUsers = await ReportedUser.find();
    return reportedUsers;
  },

  getReportedProducts: async (parent, args, ctx, info) => {
    const reportedProducts = await ReportedProduct.find();
    return reportedProducts;
  },

  getReportUser: async (parent, { reportId }, { userCtx }, info) => {
    const reportedUser = await ReportedUser.findById(reportId);
    if (!reportedUser) {
      throw new Error("Report Not Found.");
    }
    return reportedUser;
  },

  getReportProduct: async (parent, { reportId }, { userCtx }, info) => {
    const reportedProduct = await ReportedProduct.findById(reportId);
    if (!reportedProduct) {
      throw new Error("Report Not Found.");
    }
    return reportedProduct;
  },

  getFollowData: async (parent, { userId }, { userCtx }, info) => {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    const followers = await User.find({
      following: { $elemMatch: { $eq: userId } },
    });

    const followings = user.following.map(async (user) => {
      const userData = await User.findById(user);
      return {
        id: userData.id,
        profile: userData.profile,
        username: userData.username,
        desc: userData.desc,
      };
    });
    return { followers, followings };
  },

  // Notification
  getNotifications: async (
    parent,
    { offset = 0, limit = 10 },
    { userCtx },
    info
  ) => {
    if (!userCtx) {
      throw new Error("You are not authenticated!");
    }

    const result = await getNotificationsWithPage(userCtx.id, offset, limit);

    return result;
  },
};

export default Query;
