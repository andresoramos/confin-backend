const express = require("express");
const decode = require("jwt-decode");
const { NewUser } = require("../model/newUser");
const { Business } = require("../model/business");
const { preferences } = require("@hapi/joi");

const authRouter = express.Router();

authRouter.post("/", async (req, res) => {
  if (req.body.userToken === null) {
    return res.send(false);
  }
  const decoded = decode(req.body.userToken)._id;
  const user = await NewUser.findById(decoded);
  if (user !== null) {
    return res.send(true);
  }
  return res.send(false);
});
authRouter.post("/hearts", async (req, res) => {
  const { userInfo, businessId } = req.body;
  const business = await Business.findById(businessId);
  if (business) {
    const hearts = business.liked;

    if (hearts !== undefined) {
      return res.send(hearts);
    } else {
      return res.send(false);
    }
  }
});
authRouter.post("/userInfo", async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await NewUser.findById(userId);
    const { firstName, lastName } = user;
    const returned = { firstName, lastName };
    res.send(returned);
  } catch (error) {
    console.log(`You had an error at auth.js/userInfo: ${error}`);
  }
});
authRouter.post("/userFavorites", async (req, res) => {
  if (req.body.userId === undefined) {
    res.status(404).send("User Id cannot be empty.");
  }
  let finalArray = [];
  const user = await NewUser.findById(req.body.userId);
  const businesses = user.favorites;

  for (var key in businesses) {
    const business = await Business.findById(key);
    finalArray.push(business);
  }
  return res.send(finalArray);
  // const { userInfo } = req.body;
  // const business = await Business.find({ liked: { $exists: true } });
  // let returnArr = [];
  // for (var i = 0; i < business.length; i++) {
  //   if (business[i].liked[userInfo._id] === true) {
  //     returnArr.push(business[i]);
  //   }
  // }
  // res.send(returnArr);
});

authRouter.post("/cleanse", async (req, res) => {
  try {
    const id = req.body._id;

    await Business.update({ _id: id }, { $unset: { liked: "" } });
    res.send("Pass");
  } catch (error) {
    console.log("This is your cleansing error in auth.js: ", error);
  }
  1;
});

module.exports = authRouter;
