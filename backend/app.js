const express = require("express");
const app = express();

app.use(express.json());

app.use("/api/wheels", require("./routes/wheelroutes"));

module.exports = app;
