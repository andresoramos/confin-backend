const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const favoriteSchema = new mongoose.Schema({
  decoded: {
    type: Object,
    required: true,
  },
});

function validateFavorite(user) {
  const schema = Joi.object({
    userId: Joi.string().min(1).max(1000).required(),
    companyId: Joi.string().min(1).max(1000).required(),
  });
  return ({ error, value } = schema.validate(user));
}

const Favorite = mongoose.model("Favorite", favoriteSchema);
module.exports = { Favorite, validateFavorite };
