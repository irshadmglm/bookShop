const express = require('express');
const orderController = require('../../controllers/user/orderController');
const router = express.Router();


router.get('/',orderController.userOrder);

router.get('/check-out',orderController.getCheckOut);

router.get('/direct-check-out',orderController.directOreder);

router.post('/check-out',orderController.postCheckOut);

router.post('/direct-check-out', orderController.directCheckout);

router.post('/cancel-from-order',orderController.cancelOrder);

router.post('/return-order',orderController.returnBook);


module.exports = router;