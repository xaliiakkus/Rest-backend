const express = require('express')
const router = express.Router()
const {
    register,
    login,
    logout,
    resetPassword,
    forwardPassword,
    userDetails
} = require('../controllers/user')
const { authorizationMid } = require('../middleware/auth')


router.get('/me', userDetails ,authorizationMid)
router.post('/register', register)
router.post('/login', login , authorizationMid)
router.get('/logout', logout)
router.post('/reset/:token', resetPassword)
router.post('/forwardPassword', forwardPassword )

module.exports = router