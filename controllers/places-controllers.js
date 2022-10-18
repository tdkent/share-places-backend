const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const Place = require('../models/place');
const getCoordsForAddress = require('../utils/location');

// let DUMMY_PLACES = [
//   {
//     id: 'place1',
//     title: 'Montezuma Castle National Monument',
//     description:
//       'Ancient cliff dwelling built by the Sinugua people between approximately AD 1100 and 1425.',
//     location: {
//       lat: 34.6115755,
//       lng: -111.8349854,
//     },
//     address: 'Montezuma Castle Rd, Camp Verde, AZ',
//     creator: 'user1',
//   },
// ];

// Note: Mongo will return an array if multiple query results are possible (ie, find()), and an object if only one query result is possible (ie, findById())

const getPlaceByPlaceId = async (req, res, next) => {
  const { placeId } = req.params;
  try {
    // returns an object
    const result = await Place.findById(placeId);
    console.log(result);
    if (!result) {
      return next(
        new HttpError(
          'Could not be find a place for the provided place id!',
          404
        )
      );
    }
    res.status(200).json(result.toObject({ getters: true }));
  } catch (err) {
    console.error(err);
    return next(new HttpError('An error occurred. Please try again.', 500));
  }
};

const getPlacesByUserId = async (req, res, next) => {
  const { userId } = req.params;
  try {
    // returns an array
    const result = await Place.find({ creator: userId });
    console.log(result);
    if (!result.length) {
      return next(
        new HttpError('Could not find any places for the provided user id!')
      );
    }
    res
      .status(200)
      // convert Mongo objects within array to standard JS objects
      .json(result.map((place) => place.toObject({ getters: true })));
  } catch (err) {
    console.error(err);
    return next(new HttpError('An error occurred. Please try again.', 500));
  }
};

const postCreatePlace = async (req, res, next) => {
  // The second half of express-validator now fires, returning an errors object if any of the defined rules are not passed.
  // The isEmpty() method can be used to determine whether any errors are found on the error object
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // more error data available here:
    console.log(errors);
    return next(new HttpError('Invalid inputs. Please try again!', 422));
  }
  const { title, description, address, creator } = req.body;
  // create coordinate using address and Google geolocation API
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      'https://en.wikipedia.org/wiki/Montezuma_Castle_National_Monument#/media/File:2021_Montezuma_Castle_3.jpg',
    creator,
  });
  try {
    const result = await createdPlace.save();
    console.log(result);
    // HTTP 201: Created new resource
    res.status(201).json(result.toObject({ getters: true }));
  } catch (err) {
    console.error(err);
    return next(new HttpError('Creating place failed! Please try again.', 500));
  }
};

const patchEditPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError('Invalid inputs. Please try again!', 422));
  }
  const { placeId } = req.params;
  const { title, description } = req.body;
  try {
    // retrieve the item to update first, then apply updates and save()
    const place = await Place.findById(placeId);
    place.title = title;
    place.description = description;
    const result = await place.save();
    // convert to normal JS object, convert _id to id
    res.status(200).json(result.toObject({ getters: true }));
  } catch (err) {
    console.error(err);
    return next(new HttpError('Updating place failed! Please try again.'));
  }
};

const deletePlace = async (req, res, next) => {
  const { placeId } = req.params;
  try {
    const result = await Place.deleteOne({ id: placeId });
    console.log(result);
    res.status(200).json({ message: 'Delete successful!' });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        'An error occurred while attempting to delete! Please try again.'
      )
    );
  }
};

module.exports = {
  getPlaceByPlaceId,
  getPlacesByUserId,
  postCreatePlace,
  patchEditPlace,
  deletePlace,
};
