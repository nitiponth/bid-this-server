import { gql } from "apollo-server-express";

export const typeDef = gql`
  type ReportedProduct {
    id: ID!
    product: Product!
    reportBy: User!
    body: String!
    reportStatus: ReportStatus!
    createdAt: ScalarDate
  }

  scalar ScalarDate
`;
