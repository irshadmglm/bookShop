const express = require('express');
const cartController = require('../../controllers/user/cartController');
const router = express.Router();

router.get('/',cartController.getUserCart)

router.post('/add-to-cart',cartController.addToCart);

router.post('/remove-from-cart',cartController.removeFromCart)

router.post('/change-quantity', cartController.changeQuantity);



module.exports = router;
