import { gql } from "apollo-server-express";

export const NotificationTypeDef = gql`
  type Notification {
    id: ID!
    user: User!
    product: Product!
    message: String!
    createdAt: ScalarDate!
    seen: Boolean!
  }
`;
