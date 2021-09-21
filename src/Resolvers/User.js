import { Product } from "../models/Product";
import { User as UserModel } from "../models/User";

const User = {
  products: async (parent, args, ctx, info) => {
    return await Product.find({ seller: parent.id });
  },
  watchlists: async (parent, args, ctx, info) => {
    const user = await UserModel.findById(parent.id).populate("watchlists");
    return user.watchlists;
  },
};

export default User;
