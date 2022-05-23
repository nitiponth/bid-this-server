import { Product } from "../../../models/Product";
import { Transaction } from "../../../models/Transaction";
import { Types } from "mongoose";
import { User } from "../../../models/User";

export const refundCreditFromBannedProduct = async (userId) => {
  const products = await Product.aggregate([
    {
      $match: {
        buyer: { $exists: true },
        track: { $exists: false },
        $expr: {
          $and: [
            { $eq: ["$seller", Types.ObjectId(userId)] },
            { $eq: ["$status", "ACTIVED"] },
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
        buyer: 1,
        latestBid: "$price.current",
      },
    },
  ]);

  for (let index = 0; index < products.length; index++) {
    const { _id, buyer, latestBid } = products[index];
    if (buyer.toString() === userId) {
      //buyer and seller is same user
      continue;
    }

    await refundToUser(_id, buyer, latestBid);
  }

  return;
};

export const refundToUser = async (id, userId, refundValue) => {
  try {
    const user = await User.findById(userId);

    user.wallet += refundValue;

    const transaction = new Transaction({
      tranId: new Date().getTime(),
      user: userId,
      amount: refundValue,
      type: "REFUND",
      status: true,
    });

    const product = Product.findByIdAndUpdate(id, {
      status: "REFUNDED",
    });

    const result = await Promise.all([
      transaction.save(),
      user.save(),
      product,
    ]);

    if (result) {
      console.log(
        `refunded product (${result[2]._id}) to user (${result[1]._id}) for ${result[0].amount} baht, (tranId: ${result[0].tranId})`
      );
    }

    return;
  } catch (error) {
    throw new Error("Error found! => can not refund to user (refundToUser)");
  }
};
