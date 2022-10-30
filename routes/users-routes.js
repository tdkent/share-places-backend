const express = require('express')
const { check } = require('express-validator')

const router = express.Router()
const { getUsers, postRegisterUser, postLoginUser } = require('../controllers/users-controllers')

// GET /api/users
router.get('/', getUsers)
// POST /api/users/register
router.post(
  '/register',
  // express-validator checks
  check('name').not().isEmpty(),
  check('email').normalizeEmail().isEmail(),
  check('password').isLength({ min: 5 }),
  postRegisterUser
)
// POST /api/users/login
router.post('/login', postLoginUser)

module.exports = router
