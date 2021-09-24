import { PubSub } from "graphql-subscriptions";
const pubsub = new PubSub();
pubsub.ee.setMaxListeners(30); // raise max listeners in event emitter
// pubsub.ee.removeAllListeners();

export { pubsub };
