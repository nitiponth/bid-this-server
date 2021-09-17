import { gql } from "apollo-server-express";

export const typeDef = gql`
  type User {
    id: ID!
    name: Name!
    email: String!
    password: String!
    username: String!
    phone: String!
    address: Address!
    products: [Product!]!
    wallet: Int!
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
