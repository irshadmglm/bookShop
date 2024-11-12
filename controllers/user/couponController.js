const couponHelper = require("../../helpers/user/couponHelper");


module.exports = {
    getCoupons: (req,res)=>{
        couponHelper.getcoupons().then((coupons)=>{
        res.render('user/cupon',{coupons});
        })
    },
    applayCoupon: (req,res)=>{
        const {couponCode} = req.body;
        const userId = req.session.user._id;
        couponHelper.couponValue(couponCode,userId).then((value)=>{
            console.log(value);
            res.status(200).json({ discountAmount: value.discountAmount, newTotalPrice: value.newTotalPrice, success: true });
        }).catch((error)=>{
            res.status(500).json({ message: error || 'An unexpected error occurred' });
        })
    }
}