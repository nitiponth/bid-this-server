import { gql } from "apollo-server-express";

//GraphQL Schema
export const typeDef = gql`
  type Mutation {
    #User mutation
    login(email: String!, password: String!): userInformation
    logout: String
    singup(
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
      first: String
      last: String
      username: String
      phone: String
      address: String
      province: String
      postcode: String
    ): User!
    addToWatchlists(productId: ID!): User!
    depositCredit(value: Int!): User!
    withdrawCredit(value: Int!): User!

    # Product mutation
    createProduct(
      title: String!
      desc: String!
      initialPrice: Int!
      status: ProductStatus!
      start: ScalarDate!
    ): Product!
    updateProduct(
      productId: ID!
      title: String
      desc: String
      initialPrice: Int
      status: ProductStatus
      start: ScalarDate
    ): Product!
    deleteProduct(productId: ID!): String
    adminUpdateProduct(
      productId: ID!
      title: String
      desc: String
      initialPrice: Int
      status: ProductStatus
      start: ScalarDate
      end: ScalarDate
    ): Product!

    # Bid Mutation
    placeBid(productId: ID!, bidPrice: Int!): Bid!

    # Comment Muatation
    createComment(productId: ID!, body: String!, score: Float!): Comment!
  }

  type userInformation {
    token: String
    userId: String
    expired: ScalarDate
  }

  scalar ScalarDate
`;
