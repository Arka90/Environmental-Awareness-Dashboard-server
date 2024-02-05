const app = require("./app");
const helmet = require("helmet");

app.use(helmet());

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
