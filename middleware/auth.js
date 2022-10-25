const jwt = require('jsonwebtoken')

const { jwtKey } = require('../config/config')
const HttpError = require('../models/http-error')

module.exports = (req, res, next) => {
  // Browser convention is to first send an options method request to ask server if it will accept a subsequent request
  if (req.method === 'OPTIONS') {
    return next()
  }
  try {
    if (!req.headers.authorization || req.headers.authorization.split(' ')[0] !== 'Bearer') {
      return next(new HttpError('Authentication failed! Please make sure you are logged in and try again.', 401))
    }
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
      return next(new HttpError('Malformed authentication string.', 401))
    }
    // note: if the token is not valid, jwt will throw an error, which will go to the catch block and stop code execution
    const verify = jwt.verify(token, jwtKey)
    req.user = {
      userId: verify.userId,
    }
    next()
  } catch (error) {
    console.log(error)
    return next(new HttpError('Authentication failed.', 401))
  }
}
