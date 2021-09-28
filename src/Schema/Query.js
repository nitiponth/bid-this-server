import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Query {
    hello: String!
    currentNumber: Int

    #User Query
    me: User
    getUsers(username: String): [User!]!
    getOneUser(username: String!): User!
    getUserById(userId: ID!): User!
    addToWatchlists(productId: ID!): User!

    #Product Query
    getProducts(title: String): [Product!]!
    getProductById(productId: ID!): Product!
    getOneProduct(title: String!): Product!

    #Comment Query
    getComments: [Comment!]!

    #Upload Query
    # uploadedFiles: [File]
  }
`;
