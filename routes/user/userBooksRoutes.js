const express = require('express');
const booksController = require('../../controllers/user/booksController');
const router = express.Router();

router.get('/',(req,res)=>{
    bookHelper.getbooks().then((books)=>{
    
    })
})
router.get('/view-book',booksController.viewBooks);

router.post('/rating',booksController.rating);

router.get('/filter',booksController.filter)

module.exports = router;