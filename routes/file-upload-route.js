const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const upload = require('../services/file-upload')
const singleImgUpload = upload.single('image')
const { awsBucket } = require('../config/config')
const HttpError = require('../models/http-error')

// POST /api/files/file-upload
router.post('/file-upload', async function (req, res, next) {
  singleImgUpload(req, res, function (err) {
    if (err) {
      return next(new HttpError('File upload failed. Please make sure your file is JPG, JPEG, or PNG, and less than 1MB.', 422))
    }
    const imageUrl = 'https://' + awsBucket + '.s3.us-west-1.amazonaws.com/' + req.file.key
    return res.json({ imageUrl })
  })
})

module.exports = router
