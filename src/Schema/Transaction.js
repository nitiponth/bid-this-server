import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Transaction {
    id: ID!
    user: User!
    amount: Int!
    status: Boolean
    createdAt: ScalarDate!
    type: TransactionType
  }

  enum TransactionType {
    DEPOSIT
    WITHDRAW
    SELL
    BUY
  }
`;
