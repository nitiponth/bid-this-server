import mongoose from "mongoose";

const transaction = mongoose.Schema({
  tranId: { type: String },
  user: { type: mongoose.Types.ObjectId, ref: "User", require: true },
  amount: { type: Number, required: true },
  product: { type: mongoose.Types.ObjectId, ref: "User" },
  type: { type: String, required: true },
  status: { type: Boolean, required: true },
  createdAt: {
    type: Date,
    required: true,
    default: () => Date.now(),
  },
});

exports.Transaction = mongoose.model("Transaction", transaction);
