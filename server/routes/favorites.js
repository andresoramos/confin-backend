const express = require("express");
const { Favorite, validateFavorite } = require("../model/favorite");
const favoriteRouter = express.Router();
const { NewUser } = require("../model/newUser");
const { Business } = require("../model/business");
const moment = require("moment");
const { number } = require("@hapi/joi");
// const bcrypt = require("bcrypt");
// const _ = require("lodash");

favoriteRouter.get("/ip", async (req, res) => {
  //working
  var ip = req.ip;
  res.send(ip);
});
favoriteRouter.get("/liked", async (req, res) => {
  const likedBusiness = await Business.find({ liked: { $exists: true } });
  res.send(likedBusiness);
});
favoriteRouter.post("/removeFavorite", async (req, res) => {
  try {
    const { userId, companyId } = req.body;
    const user = await NewUser.findById(userId);
    const { favorites } = user;
    for (var key in favorites) {
      if (key === companyId) {
        delete favorites[key];
      }
    }
    await NewUser.update({ _id: user._id }, { $set: { favorites } });
    const company = await Business.findById(companyId);
    let { liked } = company;
    for (var key in liked) {
      if (key === companyId) {
        delete liked[key];
      }
    }
    await Business.update({ _id: companyId }, { $set: { liked } });
    return res.send(true);
  } catch (error) {
    console.log("There is an error in removeFavorite in favorites.js: ", error);
    return res.send(false);
  }
});
favoriteRouter.get("/liked", async (req, res) => {
  const likedBusiness = await Business.find({ liked: { $exists: true } });
  res.send(likedBusiness);
});
favoriteRouter.post("/ratingCreated", async (req, res) => {
  const ourRating = await Business.update(
    { _id: req.body.id },
    { $set: { ourRating: req.body.ratings } }
  );
  res.send(true);
});
favoriteRouter.post("/addReview", async (req, res) => {
  try {
    const { companyId, userId, comment, rating } = req.body;
    const business = await Business.findById(companyId);
    if (business.ourReviews) {
      /*So this is what you need to correct next week:
      you're setting the final, mean rating here in this part, but you're
      only sending back to the front end the pre-averaged score from the rating part.
      
      This means that your front end will always be one rating cycle behind on the score. 
      
      Fix this by updating the state a second time after finishing setting the comments in the DB.*/
      let ts = Math.floor(Date.now() / 1000);
      if (business.ourReviews[userId]) {
        let newReviews = { ...business.ourReviews };
        newReviews[userId] = {
          ...newReviews[userId],
          [ts]: { comment, rating: typeof rating === "number" ? rating : null },
        };
        await Business.update(
          { _id: companyId },
          { $set: { ourReviews: newReviews } }
        );
        const final = await setAverageRating(companyId, userId, "REVIEW");
        return res.send({ final, ts });
      }
      let newReviews = { ...business.ourReviews };
      newReviews[userId] = {
        [ts]: { comment, rating: typeof rating === "number" ? rating : null },
      };
      const reviewsAdded = await Business.update(
        { _id: companyId },
        { $set: { ourReviews: newReviews } }
      );
      // console.log(reviewsAdded, "This is where the problem lies");
      const final = await setAverageRating(companyId, userId);
      return res.send({ final, ts });
    }
    let ts = Math.floor(Date.now() / 1000);
    let newReviews = {
      [userId]: {
        [ts]: { comment, rating: typeof rating === "number" ? rating : null },
      },
    };
    await Business.update(
      { _id: companyId },
      { $set: { ourReviews: newReviews } }
    );
    const final = await setAverageRating(companyId, userId, "REVIEW");
    return res.send({ final, ts });
  } catch (error) {
    console.log(`You had an error in favorites.js/addReview (post): ${error}`);
  }
  res.send(true);
});
favoriteRouter.post("/ratingAdded", async (req, res) => {
  try {
    const business = await Business.findById(req.body.companyId);

    if (business.ourRating && business.ourReviews) {
      console.log("From here on out, you're hitting the second clit");
      const newRating = {
        ...business.ourRating,
        [req.body.userId]: { rating: req.body.rating },
      };

      await Business.update(
        { _id: business._id },
        { $set: { ourRating: newRating } }
      );

      const final = await setAverageRating(req.body.companyId, req.body.userId);
      console.log(final, "YOU'RE ACTUALLY HITTING FINAL!");
      return res.send({ final });
    }
    if (business.ourRating && !business.ourReviews) {
      const { rating, companyId, userId } = req.body;
      await Business.update(
        { _id: companyId },
        { $set: { ourRating: { [userId]: rating } } }
      );
      return res.send({ final: rating });
    }

    console.log("THIS IS THE PART OF THE CONDITIONAL THAT YOU'RE ENTERING");
    const ratingObj = { [req.body.userId]: { rating: req.body.rating } };
    await Business.update(
      { _id: business._id },
      { $set: { ourRating: ratingObj } }
    );

    const final = await setAverageRating(
      req.body.companyId,
      req.body.userId,
      "FINAL"
    );
    console.log(final, "this is final");
    return res.send({ final });
  } catch (error) {
    console.log(
      `You had an error in the favorites route at ratingAdded: ${error}`
    );
    return res.send(false);
  }
});

const setAverageRating = async (companyId, userId, rating) => {
  const business = await Business.findById(companyId);

  if (business.ourReviews[userId] && business.ourRating) {
    let total = 0;
    let dividedBy = 0;
    for (var key in business.ourReviews[userId]) {
      if (typeof business.ourReviews[userId][key].rating === "number") {
        total += business.ourReviews[userId][key].rating;
        dividedBy++;
      }
    }
    let final = total / dividedBy;
    if (final > -1) {
      const update = await Business.update(
        { _id: companyId },
        {
          $set: {
            ourRating: { ...business.ourRating, [userId]: { rating: final } },
          },
        }
      );
    }
    return final;
  }
};

//{name: favoriteX, id: 4, likes: ++ }
//search in the headerToken, find the user's email
//find user
//Create a user account object
//{email, userId: user._id, favoritesArray: [39849209384]}
//============================================================
favoriteRouter.post("/addFavorite", async (req, res) => {
  console.log(req.body);
  const valid = validateFavorite(req.body);
  if (valid.error) {
    return res.status(400).send(valid.error.details[0].message);
  }
  const { userId, companyId } = req.body;
  const user = await NewUser.findById(userId);
  const { favorites } = user;
  if (!favorites[companyId]) {
    favorites[companyId] = true;
    await NewUser.update({ _id: user._id }, { $set: { favorites } });
  }

  const company = await Business.findById(companyId);
  if (!company.liked) {
    await Business.update(
      { _id: company._id },
      { $set: { liked: { [companyId]: true } } }
    );
  } else {
    let { liked } = company;
    liked[companyId] = true;
    await Business.update({ _id: companyId }, { $set: { liked } });
  }
  res.send(true);
});

module.exports = favoriteRouter;
