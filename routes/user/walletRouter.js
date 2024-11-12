const express = require('express');
const walletController = require('../../controllers/user/walletController');
const router = express.Router();

router.get('/',walletController.getWallet);

router.post('/add-to-wallet',);

module.exports = router;