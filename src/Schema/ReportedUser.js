import { gql } from "apollo-server-express";

export const typeDef = gql`
  type ReportedUser {
    id: ID!
    user: User!
    reportBy: User!
    body: String!
    reportStatus: ReportUserStatus!
    createdAt: ScalarDate
  }

  enum ReportUserStatus {
    RECEIVED
    CHECKING
    DONE
  }

  scalar ScalarDate
`;
