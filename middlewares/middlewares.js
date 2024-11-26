const { ObjectId } = require('mongodb');
const collections = require('../config/collection');
const db = require('../config/connection');
const cartHelper = require('../helpers/user/cartHelper');

module.exports = {
    checkAuth: async (req, res, next) => {
        try {
            const userId = req.session?.user?._id;
            if (req.session?.logedIn && userId) {
    
                const user = await db.get()
                    .collection(collections.USER_COLLECTION)
                    .findOne({ _id: new ObjectId(userId), isBlocked: false });
    
                if (user) {
                    return next();
                }
            }
            const redirectPath = req.path === '/signup' ? 'user/signUp' : 'user/login';
            res.render(redirectPath, { message: '' });
        } catch (error) {
            console.error('Middleware error:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    cartCount:(req, res, next) => {
        const userId = req.session.user?._id;
        cartHelper.getUserCart(userId).then((cart)=>{
           if(cart){
            res.locals.cartCount = cart.items.length || 0;
           }else{
            res.locals.cartCount = 0;
           }
            next();
        })
    }
    
}