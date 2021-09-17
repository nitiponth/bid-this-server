import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Product {
    id: ID!
    title: String!
    desc: String!
    price: Price!
    seller: User!
    buyer: User
    start: ScalarDate!
    end: ScalarDate!
    status: ProductStatus!
  }

  scalar ScalarDate

  type Price {
    initial: Int!
    current: Int
  }

  enum ProductStatus {
    INACTIVED
    ACTIVED
    BIDDED
    BANNED
  }
`;
