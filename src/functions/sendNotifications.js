import Notification from "../models/Notification";
import { pubsub } from "../utils/pubsub";

export const sendNotificaitons = async ({
  sellerId,
  productId,
  productTitle,
  targetId,
  username,
}) => {
  const message = `${username} put ${productTitle} up for auction, see product details now! `;

  const notification = new Notification({
    seller: sellerId,
    target: targetId,
    product: productId,
    message,
  });

  const notificationResult = await notification.save();

  pubsub.publish(`NOTIFLY ${targetId}`, {
    userNotification: notificationResult,
  });

  return notificationResult;
};
