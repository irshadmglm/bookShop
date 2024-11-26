const express = require('express');
const booksController = require('../../controllers/user/booksController');
const booksMngController = require('../../controllers/admin/booksMngController');
const router = express.Router();
const { checkAuth } = require('../../middlewares/middlewares');
router.use(checkAuth)

router.get('/',booksController.viewBooks)

router.get('/view-book',booksController.viewBook);

router.post('/rating',booksController.rating);

router.get('/filter',booksController.filter);

router.get('/search',booksController.search);

module.exports = router;