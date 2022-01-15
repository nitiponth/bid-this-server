import { Product } from "../models/Product";
import { User as UserModel } from "../models/User";
import { Transaction } from "../models/Transaction";

const User = {
  products: async (parent, args, ctx, info) => {
    return await Product.find({ seller: parent.id });
  },
  watchlists: async (parent, args, ctx, info) => {
    const user = await UserModel.findById(parent.id).populate("watchlists");
    return user.watchlists;
  },
  auctionCount: async (parent, args, ctx, info) => {
    const currentTime = new Date().toLocaleString("en-US");
    const auctioningProduct = await Product.find({
      start: { $lt: currentTime },
      end: { $gte: currentTime },
      seller: parent.id,
    });

    const auctioning = auctioningProduct.length;

    const auctionedProduct = await Product.find({
      end: { $lte: currentTime },
      seller: parent.id,
    });

    const auctioned = auctionedProduct.length;

    const biddedProduct = await Product.find({
      end: { $lte: currentTime },
      buyer: parent.id,
    });

    const bidded = biddedProduct.length;

    return { auctioning, auctioned, bidded };
  },
  join: async (parent, args, ctx, info) => {
    const user = await UserModel.findById(parent.id);

    return user.createdAt;
  },
  transactions: async (parent, args, ctx, info) => {
    const transactions = await Transaction.find({ user: parent.id });
    return transactions;
  },
  followers: async (parent, args, ctx, info) => {
    const followers = await UserModel.find({
      following: { $elemMatch: { $eq: parent.id } },
    });

    return followers;
  },
  following: async (parent, args, ctx, info) => {
    const following = parent.following.map(async (user) => {
      const userData = await UserModel.findById(user);
      return {
        id: userData.id,
        profile: userData.profile,
        username: userData.username,
        desc: userData.desc,
      };
    });

    return following;
  },
};

export default User;
