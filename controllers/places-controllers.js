const { v4: uuidv4 } = require('uuid');

const HttpError = require("../models/http-error");

const DUMMY_PLACES = [
  {
    id: "place1",
    title: "Hagia Sophia",
    description: "Built by Emperor Justinian I in the 6th Century.",
    location: {
      lat: 41.008583,
      lng: 28.980175,
    },
    address:
      "Sultan Ahmet, Ayasofya Meydanı No:1, 34122 Fatih/İstanbul, Turkey",
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
];

const getPlaceByPlaceId = (req, res, next) => {
  const { placeId } = req.params;
  const filterPlace = DUMMY_PLACES.filter((place) => placeId === place.id);
  if (!filterPlace.length) {
    throw new HttpError(
      "Could not be find a place for the provided place id!",
      404
    );
  }
  res.json({ filterPlace });
};

const getPlaceByUserId = (req, res, next) => {
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
  res.status(201).json({ place: createdPlace });
};

module.exports = {
  getPlaceByPlaceId,
  getPlaceByUserId,
  postCreatePlace,
};
