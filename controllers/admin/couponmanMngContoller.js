const couponManagementHelper = require("../../helpers/admin/couponManagementHelper");


module.exports = {
    getcoupons:(req,res)=>{
        couponManagementHelper.getcoupons().then((coupons)=>{
        res.render('admin/couponManagement',{coupons});
        })
    },
    couponForm: (req,res)=>{
        res.render('admin/addCoupon');
    },
    addCoupon: (req,res)=>{
        console.log(req.body);
        couponManagementHelper.addCoupon(req.body).then((response)=>{
            res.redirect('/admin/coupon-management');
        })
        
    }
}