const express = require('express');
const couponmanMngContoller = require('../../controllers/admin/couponmanMngContoller');
const router = express.Router();

router.get('/',couponmanMngContoller.getcoupons)

router.get('/add-coupon',couponmanMngContoller.couponForm);

router.post('/add-coupon', couponmanMngContoller.addCoupon);

module.exports = router;              