import { User } from "../models/User";
import { Product } from "../models/Product";
import { Comment } from "../models/Comment";
import mongoose from "mongoose";

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

  // Comment Query
  getComments: async (parent, args, ctx, info) => {
    const comments = await Comment.find();
    return comments;
  },
};

export default Query;