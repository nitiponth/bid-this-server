import { gql } from "apollo-server-express";

export const typeDef = gql`
  type ReportedUser {
    id: ID!
    user: User!
    reportBy: User!
    body: String!
    reportStatus: ReportStatus!
    createdAt: ScalarDate
  }

  enum ReportStatus {
    RECEIVED
    CHECKING
    DONE
  }

  scalar ScalarDate
`;
