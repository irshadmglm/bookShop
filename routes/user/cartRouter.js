const express = require('express');
const cartHelper = require('../../helpers/user/cartHelper');
const router = express.Router();

router.get('/',(req,res)=>{
    cartHelper.getUserCart(req.session.user._id).then((items)=>{
        console.log(items);
        
        res.render('user/userCart',{items:items})
    }).catch((err)=>{
        console.log(err);
        
    })
})

router.post('/add-to-cart',(req,res)=>{
    const {bookId} = req.body;
    cartHelper.addToCart(bookId,req.session.user._id).then((response)=>{
        res.status(200).json({ message: response, success: true });
    }).catch((error)=>{
        console.log(error);
        
        res.status(500).json({ message: error.message, success: false });
    })
})
router.post('/remove-from-cart',(req,res)=>{
    const {bookId} = req.body;
    cartHelper.removeFromCart(bookId,req.session.user._id).then((response)=>{
        res.status(200).json({ message: response, success: true });
    }).catch((err)=>{
        res.status(500).json({ message: error.message, success: false });
    })
})


module.exports = router;
