import { gql } from "apollo-server-express";

//GraphQL Schema
export const typeDefs = gql`
  type Query {
    hello: String!
    getUsers(username: String): [User!]!
    getOneUser(username: String!): User!
  }
  type Mutation {
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
  }

  type User {
    id: ID!
    name: Name!
    email: String!
    password: String!
    username: String!
    phone: String!
    address: Address!
    product: [Product!]!
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

  type Product {
    id: ID!
    title: String!
    desc: String!
    price: Int!
  }
`;
