// const aws = require('aws-sdk')
// const multer = require('multer')
// const multerS3 = require('multer-s3')

// aws.config.update({
//   secretAccessKey: awsKeySecret,
//   accessKeyId: awsKeyId,
//   region: 'us-west-1',
// })

// const s3 = new aws.S3()

// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'tk-share-places',
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: 'TESTING_META_DATA' })
//     },
//     key: function (req, file, cb) {
//       cb(null, Date.now().toString())
//     },
//   }),
// })

const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const { v4: uuidv4 } = require('uuid')

const { awsKeyId, awsKeySecret, awsBucket } = require('../config/config')

const s3 = new S3Client({
  region: 'us-west-1',
  credentials: {
    accessKeyId: awsKeyId,
    secretAccessKey: awsKeySecret,
  },
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb(new Error('Invalid MIME type, only JPG, JPEG or PNG files are allowed.'), false)
  }
}

const upload = multer({
  fileFilter,
  limits: { fileSize: 1000000 },
  storage: multerS3({
    s3,
    bucket: awsBucket,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname })
    },
    key: function (req, file, cb) {
      cb(null, uuidv4() + '-' + file.originalname)
    },
  }),
})

module.exports = upload
