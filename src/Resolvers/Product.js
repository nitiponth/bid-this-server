import { Product as ProductModel } from "../models/Product";
import { User } from "../models/User";
import { Bid } from "../models/Bid";

const Product = {
  seller: async (parent, args, ctx, info) => {
    const user = await User.findById(parent.seller);
    return user;
  },
  buyer: async (parent, args, ctx, info) => {
    const currentTime = new Date();
    if (parent.end > currentTime) {
      return null;
    }

    if (!parent.price.current) {
      return null;
    }

    let bidInfo;
    if (parent.price.current) {
      bidInfo = await Bid.find({ product: parent.id }).sort({
        bidTime: -1,
      });
    }
    if (!parent.buyer) {
      const buyer = await User.findById(bidInfo[0].bidder.toString());
      parent.buyer = buyer;
      await parent.save();
    }

    return await User.findById(parent.buyer);
  },
  bids: async (parent, args, ctx, info) => {
    return await Bid.find({ product: parent.id });
  },
  createdAt: async (parent, args, ctx, info) => {
    const product = await ProductModel.findById(parent.id);
    return product.createdAt;
  },
};

export default Product;
