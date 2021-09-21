import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Subscription {
    productUpdated: Product!
  }
`;
