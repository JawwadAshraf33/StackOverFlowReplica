const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");

//bring all routes
const auth = require("./routes/api/auth");
const questions = require("./routes/api/questions");
const profile = require("./routes/api/profile");

const app = express();

//middleware for bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//mongoDb configuration
const db = require("./setup/myurl").mongoURL;
//attempt to connect to database
mongoose
  .connect(db)
  .then(() => {
    console.log(" Mongo Db connected successfully");
  })
  .catch(err => console.log(err));

//use passport
app.use(passport.initialize());

// Config jwt strategy
require("./strategies/jsonwtStrategy")(passport);
const port = process.env.PORT || 3000;

//route for testing
app.get("/", (req, res) => {
  res.send("This is start of bigStack !!2!");
});

app.use("/api/questions", questions);
app.use("/api/auth", auth);
app.use("/api/profile", profile);

app.listen(port, () => console.log("App is running on port " + port));
