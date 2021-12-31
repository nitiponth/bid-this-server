import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { ApolloServer, gql } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";
import { SubscriptionServer } from "subscriptions-transport-ws";
import mongoose from "mongoose";

import { typeDef as QueryType } from "./Schema/Query";
import { typeDef as MutationType } from "./Schema/Mutation";
import { typeDef as UserType } from "./Schema/User";
import { typeDef as ProductType } from "./Schema/Product";
import { typeDef as BidType } from "./Schema/Bid";
import { typeDef as CommentType } from "./Schema/Comment";
import { typeDef as SubscriptionType } from "./Schema/Subscription";
import { typeDef as TransactionType } from "./Schema/Transaction";
import { typeDef as ReportedUserType } from "./Schema/ReportedUser";
import { typeDef as ReportedProductType } from "./Schema/ReportedProduct";

import Query from "./Resolvers/Query";
import Mutation from "./Resolvers/Mutation";
import ScalarDate from "./Resolvers/ScalarDate";
import User from "./Resolvers/User";
import Product from "./Resolvers/Product";
import Bid from "./Resolvers/Bid";
import Comment from "./Resolvers/Comment";
import Subscription from "./Resolvers/Subscription";
import Transaction from "./Resolvers/Transaction";
import ReportedUser from "./Resolvers/ReportedUser";
import ReportedProduct from "./Resolvers/ReportedProduct";

import xjwt from "express-jwt";
import blacklist from "express-jwt-blacklist";
require("dotenv").config();

import { pubsub } from "./utils/pubsub";

const startServer = async () => {
  const app = express();
  const httpServer = createServer(app);

  blacklist.configure({
    tokenId: "jti",
  });

  app.use(
    xjwt({
      secret: process.env.JWT_SECRET,
      algorithms: ["HS256"],
      credentialsRequired: false,
      isRevoked: blacklist.isRevoked,
    })
  );

  const schema = makeExecutableSchema({
    typeDefs: [
      QueryType,
      MutationType,
      UserType,
      ProductType,
      BidType,
      CommentType,
      SubscriptionType,
      TransactionType,
      ReportedUserType,
      ReportedProductType,
    ],
    resolvers: {
      Query,
      Mutation,
      ScalarDate,
      User,
      Product,
      Bid,
      Comment,
      Subscription,
      Transaction,
      ReportedUser,
      ReportedProduct,
    },
  });

  const server = new ApolloServer({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
    context: ({ req }) => {
      const header = req.headers.authorization || "";
      const token = header.split(" ")[1];
      const userCtx = req.user || null;
      return { token, userCtx, pubsub };
    },
  });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    { server: httpServer, path: "/subscriptions" }
  );

  await server.start();
  server.applyMiddleware({ app });
  process.setMaxListeners(0);

  await mongoose.connect(
    "mongodb+srv://gorgias:testpassword123456@cluster0.regwz.mongodb.net/testDb?retryWrites=true&w=majority"
  );

  httpServer.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();
