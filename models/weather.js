const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A weather must belongs to some Place"],
  },
  date: [],
  temperature: [],
  pressure: [],
  humidity: [],
});

const Weather = mongoose.model("Weather", weatherSchema);
module.exports = Weather;
