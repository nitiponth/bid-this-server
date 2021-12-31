import mongoose from "mongoose";

const reportedUser = mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User", require: true },
    reportBy: { type: mongoose.Types.ObjectId, ref: "User", require: true },
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

exports.ReportedUser = mongoose.model("ReportedUser", reportedUser);
