const { Schema, model, default: mongoose } = require('mongoose')

const placeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  // the actual image will NOT be stored in the db, only a url pointer
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  // mongoose.Types.ObjectId is the assigned id for a Mongo document
  // ref: 'User' creates a connection to the User model
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
})

// Note: mongoose will attempt to save() this model to a collection called 'places'. It will create the collection if one does not already exist.
const Place = mongoose.model('Place', placeSchema)

module.exports = Place
