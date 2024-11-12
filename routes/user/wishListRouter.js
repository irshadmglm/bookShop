const express = require('express');
const wishlistController = require('../../controllers/user/wishlistController');
const router = express.Router();

router.get('/',wishlistController.getWishlist);

router.post('/add-to-wishlist', wishlistController.changeWishList);

router.post('/remove-from-wishlist',wishlistController.removeFromWishlist);

router.get('/getwishlist-status',wishlistController.getwishlistIds);

module.exports = router;