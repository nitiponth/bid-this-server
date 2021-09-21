import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Bid {
    product: Product!
    bidPrice: Int!
    bidder: User!
    bidResult: String
    bidTime: ScalarDate!
  }

  scalar ScalarDate
`;
