import { gql } from "apollo-server-express";

export const typeDef = gql`
  type ReportedProduct {
    id: ID!
    product: Product!
    reportBy: User!
    body: String!
    reportStatus: ReportProductStatus!
    createdAt: ScalarDate
  }

  enum ReportProductStatus {
    RECEIVED
    CHECKING
    DONE
  }

  scalar ScalarDate
`;
