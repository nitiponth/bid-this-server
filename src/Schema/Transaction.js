import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Transaction {
    id: ID!
    user: User!
    amount: Int!
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
