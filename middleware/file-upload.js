const multer = require('multer')
const { v4: uuidv4 } = require('uuid')

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
}

const upload = multer({
  // upload limit of 500000 bytes = 500 KB
  limits: 500000,
  storage: multer.diskStorage({
    // configure storage
    destination: (req, file, callback) => {
      callback(null, 'uploads/images')
    },
    // generate random file name with correct extension
    filename: (req, file, callback) => {
      const ext = MIME_TYPE_MAP[file.mimetype]
      callback(null, uuidv4() + '.' + ext)
    },
  }),
  // image file validation
  fileFilter: (req, file, callback) => {
    // if the correct extension cannot be found in the allowed mime type list, isValid will be undefined.
    // !!undefined and !!null converts to false
    const isValid = !!MIME_TYPE_MAP[file.mimetype]
    let error = isValid ? null : new Error('Invalid mime type.')
    callback(error, isValid)
  },
})

module.exports = upload
