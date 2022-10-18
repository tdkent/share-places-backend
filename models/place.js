const { Schema, model, default: mongoose } = require('mongoose');

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
  creator: { type: String, required: true },
});

// Note: mongoose will attempt to save() this model to a database called 'place'
const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
