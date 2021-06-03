const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const depthLimit = require("graphql-depth-limit");
const path = require("path");
const app = express();
//const __dirname = path.resolve();
//console.log(__dirname);
app.use(express.static("public"));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/aaa.html");
  //res.send("ssss");
});
app.get("/aaa", function (req, res) {
  res.send("ssss");
});
const typeDefs = gql`
  type Query {
    test: String
  }
  type Mutation {
    editTest(id: String): String
  }
`;
const resolvers = {
  Query: {
    test: (root, {}, context) => {
      return "aaa0";
    },
  },
  Mutation: {
    editTest: (root, { id }, context) => {
      return "aaa1";
    },
  },
};

const noiseServer = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  introspection: true,
  playground: true,
  context: ({ req }) => ({ token: req.headers["x-token"] }),
  validationRules: [depthLimit(5)],
});
noiseServer.applyMiddleware({ app, path: "/api" });

app.listen(process.env.PORT || 5000, () => {
  console.log("啟動 http://localhost:5000/");
}); //連接 port
