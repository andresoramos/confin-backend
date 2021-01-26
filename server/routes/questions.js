const express = require("express");
const { Questions } = require("../model/newUser");

const questionsRouter = express.Router();

questionsRouter.get("/", async (req, res) => {
  try {
    const questions = await Questions.find();
    return res.send(questions[0]);
  } catch (error) {
    console.log(`There was an error at questions.js.get("/"): ${error}`);
  }
});

module.exports = questionsRouter;
