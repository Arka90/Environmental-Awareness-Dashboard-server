const axios = require("axios");
const Weather = require("../models/weather");
const { response } = require("../app");
const moment = require("moment");
module.exports.getLiveData = async (req, res) => {
  try {
    const { lat, lng } = req.params;

    if (!lat || !lng)
      return res.status(400).json({ message: "Lat and Lng required" });

    const options = {
      method: "GET",
      url: `https://open-weather13.p.rapidapi.com/city/latlon/${lat}/${lng}`,
      headers: {
        "X-RapidAPI-Key": process.env.OPEN_WEATHER_API_KEY,
        "X-RapidAPI-Host": "open-weather13.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);
    return res.status(200).send({ data: response.data });

    return res.status(200).json({ message: "Success" });
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

    let options = {
      method: "GET",
      url: `https://open-weather13.p.rapidapi.com/city/latlon/${lat}/${lng}`,
      headers: {
        "X-RapidAPI-Key": process.env.OPEN_WEATHER_API_KEY,
        "X-RapidAPI-Host": "open-weather13.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);

    let weather = await Weather.findOne({ name: response.data.name });

    const date = Date.now();
    let startDate = new Date(date - 1000 * 2 * 24 * 60 * 60);
    let endDate = new Date(date - 1000 * 6 * 24 * 60 * 60);

    startDate = `${startDate.getFullYear()}-${
      startDate.getMonth() + 1 < 10
        ? "0" + (startDate.getMonth() + 1)
        : startDate.getMonth() + 1
    }-${
      startDate.getDate() < 10 ? "0" + startDate.getDate() : startDate.getDate()
    }`;

    endDate = `${endDate.getFullYear()}-${
      endDate.getMonth() + 1 < 10
        ? "0" + (endDate.getMonth() + 1)
        : endDate.getMonth() + 1
    }-${endDate.getDate() < 10 ? "0" + endDate.getDate() : endDate.getDate()}`;

    const response2 = await axios.get(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${endDate}&end_date=${startDate}&hourly=relative_humidity_2m&hourly=temperature_2m&hourly=pressure_msl`
    );

    if (!weather) {
      weather = await Weather.create({
        name: response.data.name,
      });
    }

    let tempHistory = [];
    let pressureHistory = [];
    let humidityHistory = [];
    let time = [];

    for (let i = 0; i < 5; i++) {
      time.push(response2.data.hourly.time[i * 24]);
      tempHistory.push(response2.data.hourly.temperature_2m[i * 24]);
      pressureHistory.push(response2.data.hourly.pressure_msl[i * 24]);
      humidityHistory.push(response2.data.hourly.relative_humidity_2m[i * 24]);
    }

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
