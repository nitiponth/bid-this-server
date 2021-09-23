import { pubsub } from "../utils/pubsub";

import { Product } from "../models/Product";
const Subscription = {
  userCreated: {
    subscribe: () => {
      return pubsub.asyncIterator(["USER_CREATED"]);
    },
  },
  productCreated: {
    subscribe: () => {
      return pubsub.asyncIterator("PRODUCT_CREATED");
    },
  },
  bidPlaced: {
    subscribe: async (parent, { productId }, ctx, info) => {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found.");
      }
      return pubsub.asyncIterator(`BID_PLACED ${productId}`);
    },
  },
};

export default Subscription;
