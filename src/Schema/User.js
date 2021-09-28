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
    wallet: Int!
    profile: String
    cover: String
    kyc: Kyc
    status: Status!
    role: Role!
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
