const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { jwtKey } = require('../config/config')
const HttpError = require('../models/http-error')
const User = require('../models/user')

const getUsers = async (req, res, next) => {
  try {
    // excludes the password field from the returned object
    const users = await User.find({}, '-password')
    res.status(200).json(users.map((user) => user.toObject({ getters: true })))
  } catch (error) {
    console.log(error)
    return next(new HttpError('An error occurred retrieving users. Please try again.', 500))
  }
}

const postRegisterUser = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    return next(new HttpError('Invalid inputs. Please try again!', 422))
  }
  const { name, email, password, image } = req.body
  try {
    const checkExistingUser = await User.findOne({ email })
    if (checkExistingUser) {
      return next(new HttpError('A user with that email address already exists. Please try again, or log in.', 422))
    }
    const hash = await bcrypt.hash(password, 12)
    const createdUser = new User({
      username: name,
      email,
      password: hash,
      image,
      places: [],
    })
    await createdUser.save()
    const token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, jwtKey, { expiresIn: '2 days' })
    res.status(201).json({ message: `User account ${email} created!`, token, userId: createdUser.id, email: createdUser.email })
  } catch (error) {
    console.log(error)
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
    const checkPw = await bcrypt.compare(password, user.password)
    if (!checkPw) {
      return next(new HttpError('Incorrect password. Please try again.', 401))
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, jwtKey, { expiresIn: '2 days' })
    res.status(200).json({ message: `Login successful. Welcome back ${user.username}!`, userId: user.id, email: user.email, token })
  } catch (error) {
    console.log(error)
    return next(new HttpError('Login failed! Please try again', 500))
  }
}

module.exports = {
  getUsers,
  postRegisterUser,
  postLoginUser,
}
