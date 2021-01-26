const express = require("express");
// const userTestRouter = require("../routes/user");
const newUserRouter = require("../routes/newUser");
const loginRouter = require("../routes/login");
const favoriteRouter = require("../routes/favorites");
const userTestRouter = require("../routes/user");
const authRouter = require("../routes/auth");
const questionsRouter = require("../routes/questions");

var cors = require("cors");
const { required } = require("@hapi/joi");

function loadAllRoutes(app) {
  app.use(express.json());

  app.use("/api/businesses/", userTestRouter);
  app.use("/api/userRegistration/", newUserRouter);
  app.use("/api/userLogin/", loginRouter);
  app.use("/api/favorites/", favoriteRouter);
  app.use("/api/users/", userTestRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/questions", questionsRouter);
}

module.exports = loadAllRoutes;
