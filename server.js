import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import path from "path";
//import a from "./aaa/abc.js";

const app = express();
const __dirname = path.resolve();
console.log(__dirname);
app.use(express.static("public")); //使用靜態資料夾
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/aaa.html"); //發送index.html
});

/**
 * graphql的東西
 */

//假資料
const users = [
  {
    id: 1,
    name: "A",
    age: 10,
  },
  {
    id: 2,
    name: "B",
    age: 20,
  },
  {
    id: 3,
    name: "C",
    age: 30,
  },
];

const schema = buildSchema(`
  type User {
    id: Int
    name: String
    age: Int
  }
  type Query {
    me: User
    user(id: Int): User
    users: [User]
  }
`);
const rootValue = {
  me: () => users[0],
  user: ({ id }) => users.find((el) => el.id === id),
  users: () => users,
};

/**
 * 查詢條件

{
  me {
    id
    name
    age
  }
}

{
  user(id:1) {
    id
    name
    age
  }
}

{
  users {
    id
    name
    age
  }
}
*/

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
  })
); //啟用graphql工具
app.all("/aaa", function (req, res, next) {
  console.log(res);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  //next();
  res.send({ aaa: "asdasd" });
});
/*app.get("/aaa", function (req, res) {
  //console.log(res.req.query);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  //res.send({ aaa: "asdasd" });
});*/
/*app.delete("/ccc", function (req, res) {
  console.log(res.req.query);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.send({ aaa: "asdasd" });
});*/

app.listen(process.env.PORT || 4001, () => {
  console.log("啟動 http://localhost:4001/");
}); //連接 port
