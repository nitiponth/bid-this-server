import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Product {
    id: ID!
    title: String!
    desc: String!
    price: Price!
    seller: User!
    buyer: User
    bids: [Bid!]!
    start: ScalarDate!
    end: ScalarDate!
    category: Category!
    condition: String!
    shipping: String!
    status: ProductStatus!
    images: [String!]!
    policy: [String!]!
    createdAt: ScalarDate!
  }

  scalar ScalarDate

  type Price {
    initial: Int!
    bidOffer: Int
    current: Int
  }

  enum ProductStatus {
    INACTIVED
    ACTIVED
    BIDDED
    BANNED
  }

  enum Category {
    CLOTHING
    ELECTRONICS
    FIGURES
    OTHERS
  }
`;
