const express = require('express');
const walletController = require('../../controllers/user/walletController');
const router = express.Router();
const { checkAuth } = require('../../middlewares/middlewares');
router.use(checkAuth)

router.get('/',walletController.getWallet);

router.post('/add-to-wallet',);

module.exports = router;