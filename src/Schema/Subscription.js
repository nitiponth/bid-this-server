import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Subscription {
    userCreated: User
    productCreated: Product!
    bidPlaced(productId: ID!): BidSubPayload!
  }

  type BidSubPayload {
    product: Product!
    bidInfo: Bid!
  }
`;
