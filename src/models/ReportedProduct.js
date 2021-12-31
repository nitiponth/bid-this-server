import mongoose from "mongoose";

const reportedProduct = mongoose.Schema(
  {
    product: { type: mongoose.Types.ObjectId, ref: "Product", require: true },
    body: { type: String, require: true },
    reportStatus: { type: String, require: true },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

exports.ReportedProduct = mongoose.model("ReportedProduct", reportedProduct);
