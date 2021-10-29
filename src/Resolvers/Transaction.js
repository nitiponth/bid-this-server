import { User } from "../models/User";
import { Product } from "../models/Product";

const Transaction = {
  user: async (parent, args, ctx, info) => {
    return await User.findById(parent.user);
  },
  product: async (parent, args, ctx, info) => {
    return await Product.findById(parent.product);
  },
};

export default Transaction;
