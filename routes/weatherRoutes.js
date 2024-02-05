const express = require("express");
const weatherController = require("../controllers/weatherController");

const router = express.Router();

router.get("/getLiveData/:lat/:lng", weatherController.getLiveData);

module.exports = router;
