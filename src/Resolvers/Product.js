import { User } from "../models/User";

const Product = {
  seller: async (parent, args, ctx, info) => {
    const user = await User.findById(parent.seller);
    return user;
  },
};

export default Product;
