const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const usersRoutes = require("./routes/users-routes")
const placesRoutes = require("./routes/places-routes");
const HttpError = require('./models/http-error')
const PORT = 4000;

app.use(bodyParser.json())

app.use("/api/users", usersRoutes)
app.use("/api/places", placesRoutes);

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
  // checks to see if a response has already been sent
  // another response will not be sent in this case
  if (res.headerSent) {
    return next(error);
  }
  // check if error object being thrown has a code property
  // if not, 500 status code will be used by default
  // 500: Internal Server Error
  res.status(error.code || 500);
  // Attach a message that can be used on the frontend
  res.json({ message: error.message || "An unknown error occurred!" });
});

app.listen(PORT, () =>
  console.log(`SharePlaces API server is listening on port ${PORT}`)
);
