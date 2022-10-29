const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const upload = require('../services/file-upload')
const singleImgUpload = upload.single('image')
const { awsBucket } = require('../config/config')

// POST /api/files/file-upload

// this version works with multer-s3 v. 2.10.0
// router.post('/file-upload', singleImgUpload, function (req, res) {
//   res.send(req.file.location)
// })

router.use(auth)

router.post('/file-upload', function (req, res) {
  singleImgUpload(req, res, function (err) {
    const imageUrl = 'https://' + awsBucket + '.s3.us-west-1.amazonaws.com/' + req.file.key
    return res.json({ imageUrl })
  })
})

module.exports = router
