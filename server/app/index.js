const express = require("express"),
  cors = require("cors");
const { sequelize } = require("./db");
const router = require("./router")
require("dotenv").config();
const port = process.env.PORT;

const app = express();
app.use(cors());
app.use("/", router);
app.listen(port, async () => {
  await sequelize.sync();
  console.log(`Listening on http://localhost:${port}`);
});
