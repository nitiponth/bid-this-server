import { gql } from "apollo-server-express";

//GraphQL Schema
export const typeDef = gql`
  type Mutation {
    #User mutation
    login(email: String!, password: String!): String
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
    addWatch(productId: ID!): User!

    # Product mutation
    createProduct(
      title: String!
      desc: String!
      initialPrice: Int!
      status: ProductStatus!
      start: ScalarDate!
    ): Product!

    # Bid Mutation
    placeBid(productId: ID!, bidPrice: Int!): Bid!
  }

  scalar ScalarDate
`;
