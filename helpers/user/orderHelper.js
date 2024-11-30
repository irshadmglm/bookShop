const { ObjectId } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');
const { getUserCart } = require('./cartHelper');
const cartHelper = require('./cartHelper');
const walletHelper = require('./walletHelper');

module.exports = {
    placeOrder: (userId, addressId, items, totalPrice, paymentMethod, couponDeduction = 0 ) => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalAmount = totalPrice;
                couponDeduction = parseFloat(couponDeduction);
                items.forEach(item => {
                    item.orderStatus = "Pending"; 
                    item.statusChangedAt = new Date(),
                    
                    db.get().collection(collections.BOOK_COLLECTION).updateOne(
                        { _id: item.bookId },
                        { $inc: { "bookDetails.stock": -item.quantity } }
                    );
                });
               
                
    
                // Insert a new order for each checkout
               const order = await db.get().collection(collections.ORDER_COLLECTION).insertOne({
                    userId: new ObjectId(userId),
                    addressId: new ObjectId(addressId),
                    items: items,
                    totalAmount: totalAmount,
                    paymentMethod: paymentMethod, 
                    couponDeduction: couponDeduction,
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0]
                });
                console.log("orderrrrrrrrrr" , order);
                
                for (const item of items) {
                    try {
                        await cartHelper.removeFromCart(item.bookId,userId);
                    } catch (err) {
                        console.error(`Failed to remove item ${item.bookId} from cart:`, err);

                    }
                }
    
                resolve({message:"Order completed successfully",orderId: order.insertedId});
            } catch (error) {
                reject(error);
            }
        });
    },
    placeOneOrder: (userId, addressId, item, paymentMethod ) => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalAmount = 0;
                console.log(item);
                
                    item.bookDetails.orderStatus = "Pending"; 
                    item.bookDetails.statusChangedAt = new Date(),
                    item.bookDetails.totalPrice = item.bookDetails.price 
                    totalAmount += item.bookDetails.price;  
                    item.bookDetails.bookId = new ObjectId(item.bookDetails.bookId);
                    item.bookDetails.bookName = item.bookDetails.book_name;
                    delete item.bookDetails.book_name;
                    item.bookDetails.authorName = item.bookDetails.author_name;
                    delete item.bookDetails.author_name;
                    item.bookDetails.quantity = 1;
                    item.bookDetails.price = parseFloat(item.bookDetails.price);
                    let discountValue = 0;
                    if(item.bookDetails.discount){
                        discountValue = item.bookDetails.price * parseFloat(item.bookDetails.discount) /100
                        item.bookDetails.subtotal = item.bookDetails.price - discountValue
                    }else{
                        item.bookDetails.subtotal = item.bookDetails.price;
                    }

                
                     db.get().collection(collections.BOOK_COLLECTION).updateOne(
                        { _id: new ObjectId(item.bookDetails.bookId) },
                        { $inc: { "bookDetails.stock": -1 } }
                    );
             
                    let items = [];
                     items.push(item.bookDetails)
    
                // Insert a new order for each checkout
             const  order = await db.get().collection(collections.ORDER_COLLECTION).insertOne({
                    userId: new ObjectId(userId),
                    addressId: new ObjectId(addressId),
                    items: items,
                    totalAmount: totalAmount,
                    paymentMethod: paymentMethod,
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0]
                });
    
                resolve("Order completed successfully");
            } catch (error) {
                reject(error);
            }
        });
    },

    getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           try {
            let response = await db.get().collection(collections.ORDER_COLLECTION).find({userId: new ObjectId(userId)}).toArray()
           resolve(response);
           } catch (error) {
            reject(error)
           }
        })
    },
    cancelOrder: (bookId, orderId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                
                let order = await db.get().collection(collections.ORDER_COLLECTION).findOne( {
                    _id: new ObjectId(orderId),
                    userId: new ObjectId(userId),
                    "items.bookId": new ObjectId(bookId)
                })
                let totalAmount;

                order.items.forEach(item => {
                       totalAmount = item.subtotal;
                     db.get().collection(collections.BOOK_COLLECTION).updateOne(
                        { _id: item.bookId },
                        { $inc: { "bookDetails.stock": item.quantity } }
                    );
                });
               
               await walletHelper.addToWallet(userId,totalAmount);



                const result = await db.get().collection(collections.ORDER_COLLECTION).updateOne(
                    {
                        _id: new ObjectId(orderId),
                        userId: new ObjectId(userId),
                        "items.bookId": new ObjectId(bookId)
                    },
                    {
                        $set: { "items.$[item].orderStatus": "Cancelled", statusChangedAt: new Date() },
                    },
                    {
                        arrayFilters: [{ "item.bookId": new ObjectId(bookId) }]
                    }
                );
              
                if (result.modifiedCount > 0) {
                    resolve("Book status updated to 'canceled' successfully");
                } else {
                    reject("Book not found in order or order does not exist");
                }
            } catch (error) {
                console.error("Error canceling order:", error);
                reject("Error canceling order");
            }
        });
    }
    
    
    
}