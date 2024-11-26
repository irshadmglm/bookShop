const express = require('express');
const orderController = require('../../controllers/user/orderController');
const router = express.Router();
const { checkAuth } = require('../../middlewares/middlewares');
router.use(checkAuth)

router.get('/',orderController.userOrder);

router.get('/check-out',orderController.getCheckOut);

router.get('/direct-check-out',orderController.directOreder);

router.post('/check-out',orderController.postCheckOut);

router.post('/direct-check-out', orderController.directCheckout);

router.post('/cancel-from-order',orderController.cancelOrder);

router.post('/return-order',orderController.returnBook);

router.get('/order-success', orderController.seccess);


module.exports = router;