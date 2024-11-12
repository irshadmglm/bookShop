const express = require('express');
const offerMngController = require('../../controllers/admin/offerMngController');
const router = express.Router();

router.get('/',offerMngController.getAllOffer)

router.get('/add-offer',offerMngController.offerForm);

router.post('/add-offer',offerMngController.addOffer);

module.exports = router;              