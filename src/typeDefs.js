import { gql } from "apollo-server-express";

//GraphQL Schema
export const typeDefs = gql`
  type Query {
    hello: String!
    #User Query
    getUsers(username: String): [User!]!
    getOneUser(username: String!): User!

    #Product Query
    getProducts(title: String): [Product!]!
    getOneProduct(title: String!): Product!
  }
  type Mutation {
    #User mutation
    createUser(
      email: String!
      first: String!
      last: String!
      password: String!
      username: String!
      phone: String!
      address: String!
      province: String!
      postcode: String!
    ): User!
    updateUser(
      id: ID!
      first: String
      last: String
      username: String
      phone: String
      address: String
      province: String
      postcode: String
    ): User!

    # Product mutation
    createProduct(
      title: String!
      desc: String!
      initialPrice: Int!
      creatorId: ID!
      status: ProductStatus!
      start: Date!
    ): Product!
  }

  # User Schema
  type User {
    id: ID!
    name: Name!
    email: String!
    password: String!
    username: String!
    phone: String!
    address: Address!
    products: [Product!]!
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

  # Product Schema
  type Product {
    id: ID!
    title: String!
    desc: String!
    price: Price!
    seller: User!
    buyer: User
    start: Date!
    bid: [BidData!]!
    status: ProductStatus!
  }

  scalar Date

  type Price {
    initial: Int!
    current: Int
  }

  type BidData {
    bidPrice: Int!
    bidder: User
  }

  enum ProductStatus {
    INACTIVED
    ACTIVED
    BIDDED
    BANNED
  }
`;
