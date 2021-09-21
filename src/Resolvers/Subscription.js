const Subscription = {
  product: {
    subscribe(parent, { productId }, { userCtx }, info) {
      return userCtx.Subscription;
    },
  },
};

export default Subscription;
