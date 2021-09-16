import express from "express";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";

import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";

import xjwt from "express-jwt";
import blacklist from "express-jwt-blacklist";
require("dotenv").config();

const startServer = async () => {
  const app = express();

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

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const header = req.headers.authorization || "";
      const token = header.split(" ")[1];
      const userCtx = req.user || null;
      return { token, userCtx };
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  await mongoose.connect(
    "mongodb+srv://gorgias:testpassword123456@cluster0.regwz.mongodb.net/testDb?retryWrites=true&w=majority"
  );

  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();
