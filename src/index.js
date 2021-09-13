import express from "express";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";

import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";

const startServer = async () => {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
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
