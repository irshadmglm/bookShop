const express = require('express');
const razorpayController = require('../../controllers/user/razorpayController');
const router = express.Router();
const { checkAuth } = require('../../middlewares/middlewares');
router.use(checkAuth)

// Razorpay Routes
router.post('/razorpay/create-order', razorpayController.createOrder);

router.post('/razorpay/verify-payment', razorpayController.verifyPayment);

router.post('/save-payment',razorpayController.savePayment);

module.exports = router;