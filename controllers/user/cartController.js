const cartHelper = require('../../helpers/user/cartHelper');
const userHelper = require('../../helpers/user/userHelper');

module.exports = {
    getUserCart: (req,res)=>{
        cartHelper.getUserCart(req.session.user._id).then((items)=>{
            console.log(items);
            
            res.render('user/userCart',{items:items})
        }).catch((err)=>{
            console.log(err);
            
        })
    },
    addToCart: (req,res)=>{
        const {bookId} = req.body;
        cartHelper.addToCart(bookId,req.session.user._id).then((response)=>{
            res.status(200).json({ message: response, success: true });
        }).catch((error) => {
            console.error("Router error:", error);
            res.status(500).json({ message: error, success: false });
          });
    },
    removeFromCart: (req,res)=>{
        const {bookId} = req.body;
        cartHelper.removeFromCart(bookId,req.session.user._id).then((response)=>{
            res.status(200).json({ message: response, success: true });
        }).catch((err)=>{
            res.status(500).json({ message: error.message, success: false });
        })
    },
    changeQuantity: (req, res) => {
        const { bookId, count } = req.body;
        cartHelper.changeQuantity(count, bookId, req.session.user._id)
            .then(response => {
                res.status(200).json({ message: response, success: true });
            })
            .catch(error => {
                console.error('Error changing quantity:', error);
                res.status(500).json({ message: error || 'An unexpected error occurred' });
            });
    }
}