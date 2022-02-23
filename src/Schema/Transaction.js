import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Transaction {
    _id: ID!
    tranId: String
    user: User!
    amount: Int!
    product: Product
    status: Boolean!
    createdAt: ScalarDate!
    type: TransactionType!
  }

  enum TransactionType {
    DEPOSIT
    WITHDRAW
    SELL
    BUY
  }
`;
