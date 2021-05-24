const express = require("express");
//const path = require("path");

const app = express();
//const __dirname = path.resolve();
//app.use(express.static("public"));
app.get("/", function (req, res) {
  //res.sendFile(__dirname + "/public/aaa.html");
  res.send("ssss");
});
app.get("/aaa", function (req, res) {
  res.send("ssss");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("啟動 http://localhost:5000/");
}); //連接 port
