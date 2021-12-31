import { User } from "../models/User";

const ReportedUser = {
  user: async (parent, args, ctx, info) => {
    return await User.findById(parent.user);
  },
  reportBy: async (parent, args, ctx, info) => {
    return await User.findById(parent.reportBy);
  },
};

export default ReportedUser;
