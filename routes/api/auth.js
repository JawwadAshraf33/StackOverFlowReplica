const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jsonwt = require("jsonwebtoken");
const passport = require("passport");
const key = require("../../setup/myurl");

//@type     GET
//@route    /api/auth
//@desc     just test
//@access   public
router.get("/", (req, res) => {
  res.json({
    test: "Auth is successful"
  });
});

// import schema for person to register
const Person = require("../../models/Person");

//@type     POST
//@route    /api/auth/register
//@desc     route for registration of user
//@access   public
router.post("/register", (req, res) => {
  Person.findOne({
    email: req.body.email
  })
    .then(person => {
      if (person) {
        return res
          .status(400)
          .json({ emailerror: "Email(User) is already registered " });
      } else {
        const newPerson = new Person({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });
        //encrypt password with bycrypt module
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPerson.password, salt, (err, hash) => {
            // Store hash in your password DB.
            if (err) throw err;
            newPerson.password = hash;
            newPerson
              .save()
              .then(person => res.json(person))
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch(err => console.log(err));
});
// @type    POST
// @route    /api/auth/login
// @desc    route for login of users
// @access  PUBLIC

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  Person.findOne({ email })
    .then(person => {
      if (!person) {
        return res
          .status(404)
          .json({ emailerror: "User not found with this email" });
      }
      bcrypt
        .compare(password, person.password)
        .then(isCorrect => {
          if (isCorrect) {
            //res.json({ success: "User is able to login successfully" });
            //use payload and create token for user
            const payload = {
              id: person.id,
              name: person.name,
              email: person.email
            };
            jsonwt.sign(
              payload,
              key.secret,
              { expiresIn: 3600 },
              (err, token) => {
                res.json({
                  success: true,
                  token: "Bearer " + token
                });
              }
            );
          } else {
            res.status(400).json({ passworderror: "Password is not correct" });
          }
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

module.exports = router;
