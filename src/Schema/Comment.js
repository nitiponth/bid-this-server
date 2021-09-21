import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Comment {
    id: ID!
    product: Product!
    body: String!
    buyer: User!
    score: Float!
    createdAt: ScalarDate!
    updatedAt: ScalarDate!
  }
`;
