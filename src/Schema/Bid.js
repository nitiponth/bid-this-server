import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Bid {
    id: ID!
    product: Product!
    bidPrice: Int!
    bidder: User!
    bidResult: String
    bidTime: ScalarDate!
  }

  scalar ScalarDate
`;
