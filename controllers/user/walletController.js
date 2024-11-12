const walletHelper = require("../../helpers/user/walletHelper")


module.exports = {
 getWallet : (req,res)=>{
    const userId = req.session.user._id;
    walletHelper.getWallet(userId).then((wallet)=>{
        console.log(wallet);
        
        res.render('user/wallet',{wallet})
    })
 }
}