const express = require("express");

const router = express.Router();
const {
  getPlaceByPlaceId,
  getPlaceByUserId,
  postCreatePlace,
} = require("../controllers/places-controllers");

// GET /api/places/:placeId
router.get("/:placeId", getPlaceByPlaceId);
// GET /api/places/user/:userId
router.get("/user/:userId", getPlaceByUserId);
// POST /api/places
router.post('/', postCreatePlace)

module.exports = router;
