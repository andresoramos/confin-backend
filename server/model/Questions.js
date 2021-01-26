const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questions: {
    type: Object,
  },
});

const Questions = mongoose.model("Questions", questionSchema);
module.exports = { Questions };
