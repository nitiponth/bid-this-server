import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Bid {
    productId: ID!
    bidPrice: Int!
    bidder: User!
    bidResult: String
    bidTime: ScalarDate!
  }

  scalar ScalarDate
`;
