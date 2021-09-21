import { User } from "../models/User";
import { Product } from "../models/Product";

const Bid = {
  bidder: async (parent, args, ctx, info) => {
    return await User.findById(parent.bidder);
  },
  product: async (parent, args, ctx, info) => {
    console.log(parent.product);
    return await Product.findById(parent.product);
  },
};

export default Bid;
