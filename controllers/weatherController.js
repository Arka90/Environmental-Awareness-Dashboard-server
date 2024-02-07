const axios = require("axios");
const helper = require("../utils/helper");
const Weather = require("../models/weather");

module.exports.getLiveData = async (req, res) => {
  try {
    const { lat, lng } = req.params;

    if (!lat || !lng)
      return res.status(400).json({ message: "Lat and Lng required" });

    /*
      https://api.openweathermap.org/data/2.5/weather?lat=22.572645&lon=88.363892&appid=ffd2f88a623ef8dcc5b13c926ed82099
      
      */

    const options = {
      method: "GET",
      url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.OPEN_WEATHER_API_KEY}`,
    };

    const response = await axios.request(options);
    return res.status(200).send({ data: response.data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getHistory = async (req, res) => {
  try {
    const { lat, lng } = req.params;

    if (!lat || !lng)
      return res.status(400).json({ message: "Lat and Lng required" });

    const options = {
      method: "GET",
      url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.OPEN_WEATHER_API_KEY}`,
    };

    const response = await axios.request(options);

    let weather = await Weather.findOne({ name: response.data.name });

    const date = Date.now();
    let startDate = helper.parseDate(new Date(date - 1000 * 6 * 24 * 60 * 60));
    let endDate = helper.parseDate(new Date(date - 1000 * 2 * 24 * 60 * 60));

    // getting the historical data
    const response2 = await axios.get(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${startDate}&end_date=${endDate}&hourly=relative_humidity_2m&hourly=temperature_2m&hourly=pressure_msl`
    );

    // checking if  there is already a record for this city in our database
    if (!weather) {
      weather = await Weather.create({
        name: response.data.name,
      });
    }

    let tempHistory = [];
    let pressureHistory = [];
    let humidityHistory = [];
    let time = [];

    // creating arrays  of temperature, pressure, and humidity history from the last 5 days
    for (let i = 0; i < 5; i++) {
      time.push(response2.data.hourly.time[i * 24]);
      tempHistory.push(response2.data.hourly.temperature_2m[i * 24]);
      pressureHistory.push(response2.data.hourly.pressure_msl[i * 24]);
      humidityHistory.push(response2.data.hourly.relative_humidity_2m[i * 24]);
    }

    // updating data for  the current day with the latest information
    weather.date = time;
    weather.temperature = tempHistory;
    weather.pressure = pressureHistory;
    weather.humidity = humidityHistory;
    await weather.save();

    return res.status(200).json({
      data: weather,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getAllWeathers = async (req, res) => {
  try {
    const weathers = await Weather.find({});
    return res.status(200).json({ data: weathers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getWeatherByName = async (req, res) => {
  try {
    if (!req.query.city)
      res.status(400).json({ message: "City name is required" });
    const city = req.query.city;

    const weather = await Weather.findOne({ name: city });

    if (!weather)
      return res.status(404).json({ message: `No weather found for ${city}` });

    return res.status(200).json({ data: weather });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
