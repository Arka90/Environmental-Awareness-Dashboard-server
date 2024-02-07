const express = require("express");
const weatherController = require("../controllers/weatherController");

const router = express.Router();

router.get("/getLiveData/:lat/:lng", weatherController.getLiveData);
router.get("/getHistory/:lat/:lng", weatherController.getHistory);
router.get("/getAllWeather", weatherController.getAllWeathers);
router.get("/getWeatherByName", weatherController.getWeatherByName);

module.exports = router;
