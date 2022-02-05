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
  walletChanged: {
    subscribe: async (parent, { userId }, ctx, info) => {
      return pubsub.asyncIterator(`WALLET_CHANGED ${userId}`);
    },
  },
  followingCreateProduct: {
    subscribe: async (parent, { userId }, ctx, info) => {
      return pubsub.asyncIterator(`FOLLOWING_CREATE_PROD ${userId}`);
    },
  },
  productsChanged: {
    subscribe: async (parent, args, ctx, info) => {
      return pubsub.asyncIterator("PRODUCTS_CHANGED");
    },
  },
};

export default Subscription;
