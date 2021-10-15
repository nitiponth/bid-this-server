import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Comment {
    id: ID!
    product: Product!
    body: String!
    buyer: User!
    score: Float!
    rImages: [String]
    createdAt: ScalarDate!
    updatedAt: ScalarDate!
  }
`;
