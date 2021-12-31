import { User } from "../models/User";
import { Product } from "../models/Product";

const ReportedUser = {
  product: async (parent, args, ctx, info) => {
    return await Product.findById(parent.product);
  },
  reportBy: async (parent, args, ctx, info) => {
    return await User.findById(parent.reportBy);
  },
};

export default ReportedUser;
