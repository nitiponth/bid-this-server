import { User } from "../models/User";
import { Product } from "../models/Product";

const Notification = {
  target: async (parent, args, ctx, info) => {
    return await User.findById(parent.target);
  },
  seller: async (parent, args, ctx, info) => {
    return await User.findById(parent.seller);
  },
  product: async (parent, args, ctx, info) => {
    const product = await Product.findById(parent.product);
    if (!product) {
      throw new Error("product not found");
    }
    return product;
  },
};

export default Notification;
