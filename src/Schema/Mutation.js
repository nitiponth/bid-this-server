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
    ): String
    updateUser(
      first: String
      last: String
      username: String
      address: String
      province: String
      postcode: String
      desc: String
      profile: String
      cover: String
      idCard: String
      photo: String
    ): User!
    addToWatchlists(productId: ID!): User!
    depositCredit(value: Int!): User!
    withdrawCredit(value: Int!): User!

    # Product mutation
    createProduct(
      category: Category!
      title: String!
      condition: String!
      desc: String!
      start: ScalarDate!
      initialPrice: Int!
      bidOffer: Int!
      images: [String!]!
      shipping: String!
      policy: [String!]!
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

    # Comment Mutation
    createComment(productId: ID!, body: String!, score: Float!): Comment!

    # Upload Mutation
  }

  type userInformation {
    token: String!
    user: User!
  }

  scalar ScalarDate
`;
