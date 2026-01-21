const express = require("express");
const app = express();
app.use(express.json());

const userRoutes = require("./routes/userroutes");
const wheelRoutes = require("./routes/wheelroute");

app.use("/api/users", userRoutes);
app.use("/api/wheels", wheelRoutes);

module.exports = app;
