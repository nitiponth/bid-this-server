import { User } from "../models/User";
import Notification from "../models/Notification";
import mongoose from "mongoose";

export const getNotificationsWithPage = async (userId, offset, limit) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  try {
    const count = Notification.aggregate([
      {
        $match: {
          target: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $count: "count",
      },
    ]);

    const unseenCount = Notification.aggregate([
      {
        $match: {
          target: mongoose.Types.ObjectId(userId),

          seen: false,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $count: "unseen",
      },
    ]);

    const notifications = Notification.aggregate([
      {
        $match: {
          target: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
    ]);

    const prom = [count, unseenCount, notifications];

    const data = await Promise.all(prom);

    return {
      data: data[2],
      unseen: data[1][0]?.unseen || 0,
      metadata: {
        count: data[0][0]?.count || 0,
        current: data[2]?.length + offset || 0,
        limit,
        offset,
      },
    };
  } catch (error) {
    console.log(error);
  }
};
