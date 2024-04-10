const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "http://localhost:8081",
};

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ parseFloatingPointNumbers: true }));

require("./app/routes/auth.routes")(app);

const helper = require("./app/helper/helper");

const db = require("./app/models");
const dbConfig = require("./app/config/db.config.js");
const Role = db.role;
db.mongoose.set("strictQuery", false);
db.mongoose
  // .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
  .connect(`mongodb+srv://${dbConfig.HOST}:${dbConfig.PASSWORD}@${dbConfig.DB}.u6mabqt.mongodb.net/`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    helper.setRole();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

app.get("/", (req, res) => {
  res.json({ message: "Welcome to application." });
});

app.listen(8080, () => {
  console.log(`Server is running on port 8080.`);
});
