const express = require('express');
const userController = require('../../controllers/user/userController');
const router = express.Router();

router.get('/google', userController.googleAuth);

// Google Authentication Callback
router.get('/google/callback', userController.authCallback);

module.exports = router;

