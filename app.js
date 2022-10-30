const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config() // redundant?

const app = express()
const { port, mongoKey } = require('./config/config')

const filesRoute = require('./routes/file-upload-route')
const usersRoutes = require('./routes/users-routes')
const placesRoutes = require('./routes/places-routes')
const HttpError = require('./models/http-error')

app.use(morgan('dev'))

app.use(bodyParser.json())

// add headers to response object to validate CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*') // allows requests from only this domain ('*' would allow from any domain)
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization') // set which headers are allowed to be sent
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE') // set which methods are allowed
  next()
})

app.use('/api/files', filesRoute)
app.use('/api/users', usersRoutes)
app.use('/api/places', placesRoutes)

// General 404 handling
// This middleware will only be reached if a previous request did not receive a response
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route!', 404)
  throw error
})

// General error handling
// express recognizes middleware with four args to be an error-handling middleware.
// this function will execute if any middleware in front of it yields an error
app.use((error, req, res, next) => {
  if (res.headerSent) {
    // checks to see if a response has already been sent
    // another response will not be sent in this case
    return next(error)
  }
  // check if error object being thrown has a code property
  // if not, 500 status code will be used by default
  // 500: Internal Server Error
  res.status(error.code || 500)
  // Attach a message that can be used on the frontend
  res.json({ message: error.message || 'An unknown error occurred!' })
})

// .connect is async, so .then() and .catch() can be used
mongoose
  .connect(mongoKey)
  .then(() => {
    app.listen(port, () => {
      console.log(`SharePlaces API server is listening on port ${port}`)
    })
  })
  .catch((err) => console.log(err))
