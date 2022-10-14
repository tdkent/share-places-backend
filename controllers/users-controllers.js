const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

let DUMMY_USERS = [
  {
    id: "user1",
    name: "Bela Bartok",
    email: "bela@test.com",
    password: "testword",
  },
  {
    id: "user2",
    name: "Maurice Durufle",
    email: "maurice@test.com",
    password: "testword",
  },
  {
    id: "user3",
    name: "Samuel Barber",
    email: "samuel@test.com",
    password: "testword",
  },
];

const getUsers = (req, res, next) => {
  res.status(200).send(DUMMY_USERS);
};

const postRegisterUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs. Please try again!', 422)
    )
  }
  const { name, email, password } = req.body;
  const checkEmail = DUMMY_USERS.find((user) => user.email === email);
  if (checkEmail) {
    return next(
      // HTTP 422: Unprocessable Entity (ie, the user's inputs are invalid)
      new HttpError("That email has already been registed. Login instead?", 422)
    );
  }
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password,
  };
  DUMMY_USERS.push(newUser);
  res.status(201).send(newUser);
};

const postLoginUser = (req, res, next) => {
  const { email, password } = req.body;
  const findUser = DUMMY_USERS.find(
    (user) => user.email === email && user.password === password
  );
  if (!findUser) {
    return next(
      new HttpError("Incorrect username or password. Please try again.", 401)
    );
  }
  res
    .status(200)
    .send({ message: `Login successful. Welcome back ${findUser.name}!` });
};

module.exports = {
  getUsers,
  postRegisterUser,
  postLoginUser,
};
