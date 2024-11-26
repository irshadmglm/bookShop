const orderManagment = require("../../helpers/admin/orderManagment");
const cartHelper = require('../../helpers/user/cartHelper');
const userHelper = require('../../helpers/user/userHelper');
const orderHelper = require('../../helpers/user/orderHelper');
const bookHelper = require('../../helpers/admin/bookHelper');

module.exports = {
    userOrder: (req,res)=>{
        orderHelper.getUserOrders(req.session.user._id).then((userOrders)=>{
            res.render('user/userOrders',{userOrders:userOrders});
        })
    },
    getCheckOut:(req,res)=>{
        const userId = req.session.user._id;
       userHelper.userAddress(userId).then((address)=>{
        cartHelper.getUserCart(userId).then((cart)=>{
            let totalPrice = cart.totalPrice - cart.couponDeduction;
        res.render('user/checkout',{address,totalPrice})
        })
       })
    },
    directOreder: (req,res)=>{
        const userId = req.session.user._id;
        const bookId = req.query.bookId;
       userHelper.userAddress(userId).then((address)=>{
        bookHelper.getBook(bookId).then((data)=>{
            const [book, categories] = data;
            console.log("boooooook",book);
        res.render('user/directCheckout',{address,totalPrice:book.bookDetails.price,bookId})
        })
       })
    },
    postCheckOut: async(req,res)=>{
        const userId = req.session.user._id;
        let {addressId, addressData, paymentMethod } = req.body;
           if(addressData){
            try {
                if(addressData.address_id != '0' ){
                   await userHelper.editAddress(addressData);
                   addressId = addressData.address_id;
                }else{
                    let id = await userHelper.addAddress(addressData, userId);
                console.log("New address ID:", id);
                addressId = id;
                }
                
            } catch (error) {
                console.log("Error in adding address:", error);
                return res.status(500).json({ message: 'Failed to add new address', error });
            }
           }
        
         
        const cart = await cartHelper.getUserCart(userId);
        console.log("CART: ", cart);
        
       if(cart){
        const items = cart.items;
        const totalPrice = cart.totalPrice;
        const couponDeduction = cart.couponDeduction;
        console.log(couponDeduction,"coooooooooooooooopon");
        
        console.log("paymentMethod ",paymentMethod);
        orderHelper.placeOrder(userId, addressId, items, totalPrice, paymentMethod, couponDeduction ).then(({message,orderId})=>{
                
                res.status(200).json({ message: message, orderId, items, success: true });
                
            }).catch((error)=>{
                console.log(error);
                res.status(500).json({ message: error || 'An unexpected error occurred' });
                
            })
       }
    },
    directCheckout:async(req,res)=>{
        const userId = req.session.user._id;
        let {addressId, addressData, paymentMethod, bookId } = req.body;
           if(addressData){
            try {
                if(addressData.address_id != '0' ){
                   await userHelper.editAddress(addressData);
                   addressId = addressData.address_id;
                }else{
                    let id = await userHelper.addAddress(addressData, userId);
                console.log("New address ID:", id);
                addressId = id;
                }
                
            } catch (error) {
                console.log("Error in adding address:", error);
                return res.status(500).json({ message: 'Failed to add new address', error });
            }
           }
        let data =await bookHelper.getBook(bookId);
        const [book, categories] = data;
         
        console.log("paymentMethod ",paymentMethod);
        orderHelper.placeOneOrder(userId, addressId, book, paymentMethod ).then((response)=>{
                console.log(response);
                res.status(200).json({ message: response, success: true });
                
            }).catch((error)=>{
                console.log(error);
                res.status(500).json({ message: error || 'An unexpected error occurred' });
                
            })
    
    },
    cancelOrder: (req,res)=>{
        const {bookId,orderId} = req.body;
       
        orderHelper.cancelOrder(bookId, orderId, req.session.user._id)
            .then((response) => {
                res.status(200).json({ message: response, success: true });
            })
            .catch((error) => {
                console.error("Error in cancel-from-order route:", error);
                res.status(500).json({ message: error || 'An unexpected error occurred' });
            });
    },
    returnBook: (req,res)=>{
       const bookId = req.body.bookId;
       const orderId = req.body.orderId;
       const userId = req.session.user._id;
       const status = "returned"
       console.log(bookId,orderId);
       
       orderManagment.changeOrderStatus(orderId,bookId,userId,status )
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
    seccess: (req,res)=>{
        console.log(" it sis ifsdlfjslgnjfghsdlkfjgh");
        
        res.render('user/orderSuccess');
    }
}