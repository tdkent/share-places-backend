const { Schema, model, default: mongoose } = require('mongoose')
const validator = require('mongoose-unique-validator')

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  // mongoose.Types.ObjectId is the assigned id for a Mongo document
  // ref: 'Place' creates a connection to the 'Place' model
  // Because multiple places are possible for each user, places needs to wrapped in an array
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }],
})

// mongoose-unique-validator is a plugin which adds pre-save validation for unique fields within a Mongoose schema.
// ie, it checks the users collection for a document with a matching email.
userSchema.plugin(validator)

// Note: mongoose will attempt to save() this model to a collection called 'user'. It will create the collection if one does not already exist.
const User = model('User', userSchema)

module.exports = User
