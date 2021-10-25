import { gql } from "apollo-server-express";

export const typeDef = gql`
  type User {
    id: ID!
    name: Name!
    email: String!
    password: String!
    username: String!
    desc: String
    phone: String!
    address: Address!
    products: [Product!]!
    watchlists: [Product!]!
    auctionCount: AuctionData!
    wallet: Int!
    profile: String
    cover: String
    kyc: Kyc
    status: Status!
    role: Role!
    join: ScalarDate!
    cards: [Card]!
    transactions: [Transaction]!
  }

  type Name {
    first: String!
    last: String!
  }

  type Address {
    home: String!
    province: String!
    postcode: String!
  }

  type Kyc {
    idCard: String
    photo: String
  }

  type AuctionData {
    auctioning: Int
    auctioned: Int
    bidded: Int
  }

  type Card {
    id: ID!
    cardInfo: CardInfo
  }

  type CardInfo {
    id: ID!
    expiration_month: Int!
    expiration_year: Int!
    brand: String!
    last_digits: String!
  }

  enum Status {
    GUEST
    AUTHEN
    FULLAUTHEN
    BANNED
  }

  enum Role {
    USER
    ADMIN
  }
`;
