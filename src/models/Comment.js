import mongoose from "mongoose";

const comment = mongoose.Schema(
  {
    product: { type: mongoose.Types.ObjectId, ref: "Product" },
    body: { type: String, required: true },
    rImages: [String],
    buyer: { type: mongoose.Types.ObjectId, ref: "User" },
    score: { type: Number, required: true },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

exports.Comment = mongoose.model("Comment", comment);
