const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

let DUMMY_PLACES = [
  {
    id: "place1",
    title: "Montezuma Castle National Monument",
    description:
      "Ancient cliff dwelling built by the Sinugua people between approximately AD 1100 and 1425.",
    location: {
      lat: 34.6115755,
      lng: -111.8349854,
    },
    address: "Montezuma Castle Rd, Camp Verde, AZ",
    creator: "user1",
  },
  {
    id: "place2",
    title: "Pinnacles National Park",
    description:
      "A national monument since 1905, Pinnacles was designated a national park in 2013 by President Barack Obama.",
    location: {
      lat: 36.4905655,
      lng: -121.1824925,
    },
    address: "California 95043",
    creator: "user1",
  },
  {
    id: "place3",
    title: "Yellowstone National Park",
    description:
      "An immense wilderness area which sits atop the Yellowstone Caldera, underground volcano, Yellowstone was the first national park created in the United States.",
    location: {
      lat: 44.427963,
      lng: -110.588455,
    },
    address: "CCH6+5J Yellowstone National Park, Wyoming",
    creator: "user1",
  },
];

const getPlaceByPlaceId = (req, res, next) => {
  const { placeId } = req.params;
  const filterPlace = DUMMY_PLACES.filter((place) => placeId === place.id);
  if (!filterPlace.length) {
    return next(
      HttpError("Could not be find a place for the provided place id!", 404)
    );
  }
  res.send(filterPlace);
};

const getPlacesByUserId = (req, res, next) => {
  const { userId } = req.params;
  const filterUserPlaces = DUMMY_PLACES.filter(
    (place) => place.creator === userId
  );
  if (!filterUserPlaces.length) {
    return next(
      new HttpError("Could not find any places for that user id!", 404)
    );
  }
  res.send(filterUserPlaces);
};

const postCreatePlace = (req, res, next) => {
  // The second half of express-validator now fires, returning an errors object if any of the defined rules are not passed.
  // The isEmpty() method can be used to determine whether any errors are found on the error object
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // more error data available here:
    console.log(errors);
    return next(new HttpError("Invalid inputs. Please try again!", 422));
  }
  const { title, description, coordinates, address, creator } = req.body;
  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };
  DUMMY_PLACES.push(createdPlace);
  // HTTP 201: Created new resource
  res.status(201).send(createdPlace);
};

const patchEditPlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid inputs. Please try again!", 422));
  }
  const { placeId } = req.params;
  const { title, description } = req.body;
  // create a shallow copy of the original data before updating
  // this way, any failures in the new data can be better managed without immediately changing the original data
  const updatePlace = { ...DUMMY_PLACES.find((place) => placeId === place.id) };
  const placeIndex = DUMMY_PLACES.findIndex((place) => placeId === place.id);
  updatePlace.title = title;
  updatePlace.description = description;
  DUMMY_PLACES[placeIndex] = updatePlace;
  res.status(200).send(updatePlace);
};

const deletePlace = (req, res, next) => {
  const { placeId } = req.params;
  if (!DUMMY_PLACES.find((place) => place.id === placeId)) {
    return next(new HttpError('Delete failed. No such place exists.', 404));
  }
  DUMMY_PLACES = DUMMY_PLACES.filter((place) => place.id !== placeId);
  res.status(200).send(DUMMY_PLACES);
};

module.exports = {
  getPlaceByPlaceId,
  getPlacesByUserId,
  postCreatePlace,
  patchEditPlace,
  deletePlace,
};
