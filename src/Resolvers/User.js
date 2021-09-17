import { Product } from "../models/Product";

const User = {
  products: async (parent, args, ctx, info) => {
    return await Product.find({ seller: parent.id });
  },
};

export default User;
