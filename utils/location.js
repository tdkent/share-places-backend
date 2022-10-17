const axios = require('axios');

const HttpError = require('../models/http-error');

const getCoordsForAddress = async (address) => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GEO_API_KEY}`
  );
  const data = response.data;
  if (!data || data.response === 'ZERO_RESULTS') {
    const error = HttpError(
      'Could not find location for the specified address!',
      404
    );
    throw error;
  }
  return data.results[0].geometry.location;
};

module.exports = getCoordsForAddress;
