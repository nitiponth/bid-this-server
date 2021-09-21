import { User } from "../models/User";
import { Product } from "../models/Product";

const Comment = {
  product: async (parent, args, ctx, info) => {
    return await Product.findById(parent.product);
  },
  buyer: async (parent, args, ctx, info) => {
    return await User.findById(parent.buyer);
  },
};

export default Comment;
