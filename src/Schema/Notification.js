import { gql } from "apollo-server-express";

export const NotificationTypeDef = gql`
  type Notification {
    _id: ID!
    seller: User!
    target: User!
    product: Product!
    message: String!
    createdAt: ScalarDate!
    seen: Boolean!
  }
`;
