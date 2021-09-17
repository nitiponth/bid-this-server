import { User } from "../models/User";

const Bid = {
  bidder: async (parent, args, ctx, info) => {
    return await User.findById(parent.bidder);
  },
};

export default Bid;
