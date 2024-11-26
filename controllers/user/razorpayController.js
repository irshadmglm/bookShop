const Razorpay = require('razorpay');
const crypto = require('crypto');
const paymentHelper = require('../../helpers/user/paymentHelper');
const orderManagment = require('../../helpers/admin/orderManagment');


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = {
  createOrder: async (req, res) => {
    try {
      console.log(req.body.amount);
      
      
      const options = {
        amount: req.body.amount * 100, 
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      console.log(order);

      res.status(200).json({ success: true, order });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  verifyPayment:async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
console.log(razorpay_order_id, razorpay_payment_id, razorpay_signature );

     const orderId = req.body.orderId;
      let items = req.body.items;
      let bookId = req.body.bookId;
      let userId = req.session.user._id;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');


      if(bookId){
        await orderManagment.changeOrderStatus(orderId, bookId, userId, "Conformed")
      }else{
        items.forEach(async (item) => {
          await orderManagment.changeOrderStatus(orderId, item.bookId, userId, "Conformed")
          });
      }


    if (generatedSignature === razorpay_signature) {
      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  },
  savePayment:(req,res)=>{
    console.log(req.body);
    req.body.userId = req.session.user._id;
    console.log("now it is ok");
    
    paymentHelper.addpayment(req.body).then((response)=>{
      res.status(200).json({ success: true });
    }).catch((error)=>{
      res.status(400).json({ success: false });

    })
    
  }
};
