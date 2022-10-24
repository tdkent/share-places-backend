const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const User = require('../models/user')

const getUsers = async (req, res, next) => {
  try {
    // excludes the password field from the returned object
    const users = await User.find({}, '-password')
    console.log(users)
    res.status(200).json(users.map((user) => user.toObject({ getters: true })))
  } catch (err) {
    console.error(err)
    return next(new HttpError('An error occurred retrieving users. Please try again.', 500))
  }
}

const postRegisterUser = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    return next(new HttpError('Invalid inputs. Please try again!', 422))
  }
  const { name, email, password } = req.body
  try {
    const checkExistingUser = await User.findOne({ email })
    if (checkExistingUser) {
      return next(new HttpError('A user with that email address already exists. Please try again, or log in.', 422))
    }
    const createdUser = new User({
      username: name,
      email,
      password,
      image: req.file.path,
      places: [],
    })
    await createdUser.save()
    res.status(200).json({ message: `User account ${email} created!`, user: createdUser.toObject({ getters: true }) })
  } catch (err) {
    console.error(err)
    return next(new HttpError('Registration failed. Please try again!', 500))
  }
}

const postLoginUser = async (req, res, next) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return next(new HttpError(`Could not find an account for user ${email}. Sign up instead?`, 404))
    }
    if (user.password !== password) {
      return next(new HttpError('Incorrect password. Please try again.', 401))
    }
    res.status(200).json({ message: `Login successful. Welcome back ${user.username}!`, user: user.toObject({ getters: true }) })
  } catch (err) {
    console.error(err)
    return next(new HttpError('Login failed! Please try again', 500))
  }
}

module.exports = {
  getUsers,
  postRegisterUser,
  postLoginUser,
}
