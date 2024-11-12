const wishListHelper = require("../../helpers/user/wishListHelper")


module.exports = {
    getWishlist: (req,res)=>{
        const userId = req.session.user._id;
        wishListHelper.getWishlist(userId).then((wishlist)=>{
            console.log(wishlist);
            
            res.render('user/wishList',{wishlist})
        })
    },
changeWishList: (req, res) => {
    const userId = req.session.user._id;
    const { bookId, status } = req.body;
    console.log(req.body);
    

    if (status === 'add') {
        wishListHelper.addToWishlist(bookId, userId)
            .then(() => {
                res.status(200).json({ success: true });
            })
            .catch((error) => {
                res.status(500).json({ success: false, message: error.message });
            });
    } else if (status === 'remove') {
        wishListHelper.removeFromWishlist(bookId, userId)
            .then(() => {
                res.status(200).json({ success: true });
            })
            .catch((error) => {
                res.status(500).json({ success: false, message: error.message });
            });
    } else {
        res.status(400).json({ success: false, message: "Invalid status" });
    }
},
        removeFromWishlist: (req,res)=>{
             const userId = req.session.user._id;
             const { bookId } = req.body;


            wishListHelper.removeFromWishlist(bookId, userId)
            .then(() => {
                res.status(200).json({ success: true });
            })
            .catch((error) => {
                res.status(500).json({ success: false, message: error.message });
            });
},
getwishlistIds:(req,res)=>{
    const userId = req.session.user._id;
        wishListHelper.getWishlistIds(userId).then((books)=>{
            console.log(books);
            res.status(200).json({ success: true, books });
        }).catch((error) => {
            res.status(500).json({ success: false, message: error.message });
        });
}

}