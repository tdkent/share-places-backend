const express = require('express')
const { check } = require('express-validator')

const router = express.Router()

const auth = require('../middleware/auth')
const { getPlaceByPlaceId, getPlacesByUserId, postCreatePlace, patchEditPlace, deletePlace } = require('../controllers/places-controllers')

// We are using express-validator to validate body requests for us.
// For example, the method check('title').not().isEmpty() checks to see whether the 'title' field in the request body is empty.
// The second half of validation can be found in the specific controller functions.

// GET /api/places/:placeId
router.get('/:placeId', getPlaceByPlaceId)
// GET /api/places/user/:userId
router.get('/user/:userId', getPlacesByUserId)

// Authentication middleware
router.use(auth)

// POST /api/places
router.post('/', check('title').not().isEmpty(), check('description').isLength({ min: 5 }), check('address').not().isEmpty(), postCreatePlace)

// PATCH /api/places/:placeId
router.patch('/:placeId', check('title').not().isEmpty(), check('description').isLength({ min: 5 }), patchEditPlace)
// DELETE /api/places/:placeId
router.delete('/:placeId', deletePlace)

module.exports = router
