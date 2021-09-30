import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Subscription {
    userCreated: User
    productCreated: Product!
    bidPlaced(productId: ID!): BidSubPayload!
    walletChanged(userId: ID!): Int!
    productsChanged: String
  }

  type BidSubPayload {
    product: Product!
    bidInfo: Bid!
  }
`;
