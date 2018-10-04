const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Person Model
const Person = require("../../models/Person");

//Load Profile Model
const Profile = require("../../models/Profile");

//Load Question Model
const Question = require("../../models/Question");

// @type    GET
//@route    /api/questions/test
// @desc    route for test
// @access  PUBLIC
router.get("/test", (req, res) => {
  res.json({
    test: "Question is successful"
  });
});

// @type    POST
//@route    /api/questions/
// @desc    route for posting your questions
// @access  PRIVATE
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newQuestion = new Question({
      textone: req.body.textone,
      texttwo: req.body.texttwo,
      user: req.user.id,
      name: req.body.name
    });

    newQuestion
      .save()
      .then(question => {
        res.json(question);
      })
      .catch(err => console.log("Question not pushed in DB " + err));
  }
);

// @type    GET
//@route    /api/questions/
// @desc    route to get all questions
// @access  PUBLIC
router.get("/", (req, res) => {
  Question.find()
    .sort({ date: "desc" })
    .then(questions => res.json(questions))
    .catch(err =>
      console.log("Error in finding all questions from question model " + err)
    );
});

//@type    POST
//@route    /api/answers/:id
//@desc    route to submit answers
//@access  PRIVATE
router.post(
  "/answers/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.findById(req.params.id)
      .then(question => {
        const newAnswer = {
          user: req.user.id,
          name: req.body.name,
          text: req.body.text
        };
        question.answers.unshift(newAnswer);
        question
          .save()
          .then(question => res.json(question))
          .catch(err => console.log("Question for answer not found " + err));
      })
      .catch(err => console.log("Question for answer not found " + err));
  }
);

//@type    POST
//@route    /api/questions/upvote/:id
//@desc    route to upvote questions
//@access  PRIVATE
router.post(
  "/upvote/:id",
  passport.authenticate("jwt", { session: false }, (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Question.findById(req.params.id)
          .then(question => {
            if (
              question.upvotes.filter(
                upvote => upvote.user.toString() === req.user.id.toString()
              ).length > 0
            ) {
              return res.status(400).json({ noupvote: "User already upvoted" });
            }
            question.upvotes.unshift({ user: req.user.id });
            question
              .save()
              .then(question => res.json(question))
              .catch(err => console.log("Error in upvoting"));
          })
          .catch(err =>
            console.log("Error in finding question for profile to update")
          );
      })
      .catch(err =>
        console.log("Error in finding Profile for question upvote" + err)
      );
  })
);
module.exports = router;
