const { getCategories } = require("../../helpers/admin/bookHelper");
const offerMngHelper = require("../../helpers/admin/offerMngHelper")


module.exports = {
    getAllOffer: (req,res)=>{
        offerMngHelper.getAllOffers().then((offers)=>{
            res.render('admin/offerManagement',{offers})
        })
    },
    offerForm:(req,res)=>{
        getCategories().then((categories)=>{
        res.render('admin/addOffer',{categories});
        })
    },
    addOffer: (req,res)=>{
        offerMngHelper.addOffer(req.body).then(()=>{
            res.redirect('/admin/offer-management')
        })
    }
}