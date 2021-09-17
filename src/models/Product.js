import mongoose from "mongoose";

const product = mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    price: {
      initial: { type: Number, required: true },
      current: { type: Number },
    },
    seller: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    buyer: { type: mongoose.Types.ObjectId, ref: "User" },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: { type: String, required: true },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

exports.Product = mongoose.model("Product", product);
