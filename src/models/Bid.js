import mongoose from "mongoose";

const bid = mongoose.Schema(
  {
    productId: { type: mongoose.Types.ObjectId, ref: "Product", require: true },
    bidPrice: { type: Number, required: true },
    bidder: { type: mongoose.Types.ObjectId, ref: "User", require: true },
    bidResult: { type: String },
    bidTime: { type: Date, required: true },
  },
  {
    timestamps: {
      createdAt: false,
      updatedAt: true,
    },
  }
);

exports.Bid = mongoose.model("Bid", bid);
