const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const weatherRouter = require("./routes/weatherRoutes");
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [
      "https://environmental-awareness-dashboard-client.vercel.app",
      "http://localhost:5173",
    ],
  })
);
app.use("/weather", weatherRouter);

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("DB Sucessfully Connected 🟢");
});

module.exports = app;
