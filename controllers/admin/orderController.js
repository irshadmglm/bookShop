const orderManagment = require('../../helpers/admin/orderManagment');

module.exports = {
    getOrder: (req,res)=>{
        orderManagment.getOrders().then((response)=>{
            console.log(response);
            res.render('admin/orderManagment',{orders:response});
        })
    },

    changeItemStatus: (req, res) => {
        const { orderId, bookId, userId, status } = req.body;
      orderManagment.changeOrderStatus(orderId,bookId,userId,status)
            .then(result => {
            if (result.modifiedCount > 0) {
                res.json({ success: true });
            } else {
                res.json({ success: false });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ success: false });
        });
    },

}