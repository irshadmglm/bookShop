const express = require('express');
const couponController = require('../../controllers/user/couponController');

const router = express.Router();

router.get('/',couponController.getCoupons);

router.post('/apply-coupon',couponController.applayCoupon)


module.exports = router;
