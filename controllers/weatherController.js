const axios = require("axios");

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
