const express = require('express');
const couponController = require('../../controllers/user/couponController');
const router = express.Router();
const { checkAuth } = require('../../middlewares/middlewares');
router.use(checkAuth)

router.get('/',couponController.getCoupons);

router.post('/apply-coupon',couponController.applayCoupon)


module.exports = router;
