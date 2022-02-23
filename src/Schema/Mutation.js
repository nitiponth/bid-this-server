import { gql } from "apollo-server-express";

//GraphQL Schema
export const typeDef = gql`
  type Mutation {
    #User mutation
    login(email: String!, password: String!): userInformation
    logout: String
    singup(
      email: String!
      first: String!
      last: String!
      password: String!
      username: String!
      phone: String!
      address: String!
      province: String!
      postcode: String!
    ): String
    updateUser(
      first: String
      last: String
      username: String
      address: String
      province: String
      postcode: String
      desc: String
      profile: String
      cover: String
      idCard: String
      photo: String
    ): User!
    addToWatchlists(watchedArr: [ID]!): User!

    verifyEmail(otp: String!): String

    getNewEmailVerification: String

    toggleFollowing(userArr: [ID]!): User!

    reportUser(userId: String!, body: String!): String!

    # Admin User mutation
    adminChangeUserStatus(userId: ID!, newStatus: String!): User!

    # Product mutation
    createProduct(
      category: Category!
      title: String!
      condition: String!
      desc: String!
      start: ScalarDate!
      initialPrice: Int!
      bidOffer: Int!
      images: [String!]!
      shipping: String!
      policy: [String!]!
    ): Product!
    updateProduct(
      productId: ID!
      category: Category
      title: String
      condition: String
      start: ScalarDate
      desc: String
      initialPrice: Int
      bidOffer: Int
      images: [String]
      shipping: String
      policy: [String]
    ): Product!
    deleteProduct(productId: ID!): String
    updateProductTrack(productId: ID!, track: String!): Product!
    confirmProduct(productId: ID!): Product!

    reportProduct(productId: String!, body: String!): String!

    refundProduct(productId: ID!): String!
    extendDeliveryTime(productId: ID!): String!

    # admin product mutation
    adminUpdateProduct(
      productId: ID!
      title: String
      desc: String
      initialPrice: Int
      status: ProductStatus
      start: ScalarDate
      end: ScalarDate
    ): Product!

    adminDeactiveProduct(productId: ID!): Product!

    # Bid Mutation
    placeBid(productId: ID!, bidPrice: Int!): Bid!

    # Comment Mutation
    createComment(
      productId: ID!
      body: String!
      score: Float!
      rImages: [String]
    ): Comment!

    # Transaction Mutation
    depositCredit(
      cardId: String
      paymentInfo: PaymentInfo
      save: Boolean
      amount: Int!
    ): Transaction!

    createRep(name: String!, brand: String!, number: String!): String
    updateRepActive: String
    withdrawCredit(bankId: String!, amount: Int!): Transaction!

    updateTransactions: String

    removeCard(custId: String!): String
    removeRecipient(reptId: String!): String

    # Admin Report Mutation
    updateReportStatus(
      reportId: ID!
      type: ReportType!
      newStatus: ReportStatus!
    ): String!

    # Notification Mutation
    seenNotification(notiId: ID!): String
  }

  input PaymentInfo {
    card: String!
    name: String!
    expMonth: String!
    expYear: String!
    cvc: String!
  }

  enum ReportType {
    User
    Product
  }

  type userInformation {
    token: String!
    user: User!
  }

  scalar ScalarDate
`;
