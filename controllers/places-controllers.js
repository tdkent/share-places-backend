const { validationResult } = require('express-validator')
const mongoose = require('mongoose')
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3')

const HttpError = require('../models/http-error')
const Place = require('../models/place')
const User = require('../models/user')
const getCoordsForAddress = require('../utils/location')
const { awsKeyId, awsKeySecret, awsBucket } = require('../config/config')

// Note: Mongo will return an array if multiple query results are possible (ie, find()), and an object if only one query result is possible (ie, findById())

const getPlaceByPlaceId = async (req, res, next) => {
  const { placeId } = req.params
  try {
    const result = await Place.findById(placeId)
    if (!result) {
      return next(new HttpError('Could not be find a place for the provided place id!', 404))
    }
    res.status(200).json(result.toObject({ getters: true }))
  } catch (err) {
    console.log(err)
    return next(new HttpError('An error occurred. Please try again.', 500))
  }
}

const getPlacesByUserId = async (req, res, next) => {
  const { userId } = req.params
  try {
    // returns an array
    const result = await Place.find({ creator: userId }).populate('creator', 'username')
    res
      .status(200)
      // convert Mongo objects within array to standard JS objects
      .json(result.map((place) => place.toObject({ getters: true })))
  } catch (err) {
    console.log(err)
    return next(new HttpError('An error occurred. Please try again.', 500))
  }
}

const postCreatePlace = async (req, res, next) => {
  // The second half of express-validator now fires, returning an errors object if any of the defined rules are not passed.
  // The isEmpty() method can be used to determine whether any errors are found on the error object
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    return next(new HttpError('Invalid inputs. Please try again!', 422))
  }
  const { title, description, address, image } = req.body
  try {
    // check to see that provided user id from req.user is valid
    const existingUser = await User.findById(req.user.userId)
    if (!existingUser) {
      return next(new HttpError('You must have an account to create a new place!', 403))
    }
    // create coordinate using address and Google geolocation API
    const coordinates = await getCoordsForAddress(address)
    const createdPlace = new Place({
      title,
      description,
      address,
      location: coordinates,
      image,
      creator: req.user.userId,
    })
    // creating a place is a two-step process: 1) add place to places, 2) add place to user
    // if either fail, entire process should be stopped without any collections being altered
    // for that we can create a session...
    const session = await mongoose.startSession()
    // ...create a transaction...
    session.startTransaction()
    // ...save the new place to places collection...
    await createdPlace.save({ session })
    // ...add the new place to the corresponding user's places field locally (important: Mongo will only add the ObjectId when the data is saved)...
    existingUser.places.push(createdPlace)
    // ...update the user as part of the current session...
    await existingUser.save({ session })
    // ...and finally, if all of the steps above pass, commit the entire transaction
    const result = await session.commitTransaction()
    // HTTP 201: Created new resource
    if (result.ok === 1) res.status(201).json({ message: 'Success!' })
  } catch (error) {
    console.log(error)
    return next(new HttpError('Creating place failed! Please try again.', 500))
  }
}

const patchEditPlace = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    return next(new HttpError('Invalid inputs. Please try again!', 422))
  }
  const { placeId } = req.params
  const { title, description } = req.body
  try {
    // retrieve the item to update first, then apply updates and save()
    const place = await Place.findById(placeId).populate('creator')
    if (req.user.userId !== place.creator.id) {
      return next(new HttpError('You are not authorized to edit this post!', 403))
    }
    place.title = title
    place.description = description
    const result = await place.save()
    // convert to normal JS object, convert _id to id
    res.status(200).json({ message: 'Success!', place: result.toObject({ getters: true }) })
  } catch (err) {
    console.log(err)
    return next(new HttpError('Updating place failed! Please try again.'))
  }
}

const deletePlace = async (req, res, next) => {
  const { placeId } = req.params
  const place = await Place.findById(placeId).populate('creator')
  if (!place) {
    return next(new HttpError('Delete failed: could not find a place with that id!', 404))
  }
  if (req.user.userId !== place.creator.id) {
    return next(new HttpError('You are not authorized to delete this post!', 403))
  }
  const imageUrl = place.image.split('/')
  const imageKey = imageUrl[imageUrl.length - 1]
  try {
    // await Place.deleteOne({ id: placeId })
    // use populate to refer to another document stored in another collection, and work with its data by adding it to the returned object
    // a connection first needs to established between collections using ref in document's models
    // the argument 'creator' is provided to populate to search the corresponding user document for references to the placeId
    // since we want the operation to alter our database ONLY if the place is removed from both the places and users collections, we create a new session
    const session = await mongoose.startSession()
    session.startTransaction()
    await place.remove({ session })
    // the pull(place) method will remove the place from the user's data
    place.creator.places.pull(place)
    // creator's data can then be updated
    await place.creator.save({ session })
    session.commitTransaction()
    // Delete image file from S3 bucket
    const s3 = new S3Client({
      region: 'us-west-1',
      credentials: {
        accessKeyId: awsKeyId,
        secretAccessKey: awsKeySecret,
      },
    })
    const data = await s3.send(new DeleteObjectCommand({ Bucket: awsBucket, Key: imageKey }))
    res.status(200).json({ message: `Deleted successfully.` })
  } catch (err) {
    console.log(err)
    return next(new HttpError('An error occurred while attempting to delete! Please try again.'))
  }
}

module.exports = {
  getPlaceByPlaceId,
  getPlacesByUserId,
  postCreatePlace,
  patchEditPlace,
  deletePlace,
}
