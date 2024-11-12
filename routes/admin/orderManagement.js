const express = require('express');
const orderController = require('../../controllers/admin/orderController');
const router = express.Router();

router.get('/',orderController.getOrder)

router.post('/change-item-status', orderController.changeItemStatus);

module.exports = router;