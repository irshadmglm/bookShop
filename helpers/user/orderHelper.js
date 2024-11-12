const { ObjectId } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');
const { getUserCart } = require('./cartHelper');
const cartHelper = require('./cartHelper');
const walletHelper = require('./walletHelper');

module.exports = {
    placeOrder: (userId, addressId, items, totalPrice, paymentMethod ) => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalAmount = 0;
                items.forEach(item => {
                    item.orderStatus = "Pending"; 
                    item.statusChangedAt = new Date(),
                    item.totalPrice = item.price * item.quantity;  
                    totalAmount += item.totalPrice;  

                     db.get().collection(collections.BOOK_COLLECTION).updateOne(
                        { _id: item.bookId },
                        { $inc: { "bookDetails.stock": -item.quantity } }
                    );
                });
               
                
    
                // Insert a new order for each checkout
                await db.get().collection(collections.ORDER_COLLECTION).insertOne({
                    userId: new ObjectId(userId),
                    addressId: new ObjectId(addressId),
                    items: items,
                    totalAmount: totalAmount,
                    paymentMethod: paymentMethod,
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0]
                });
    
                for (const item of items) {
                    try {
                        await cartHelper.removeFromCart(item.bookId,userId);
                    } catch (err) {
                        console.error(`Failed to remove item ${item.bookId} from cart:`, err);

                    }
                }
    
                resolve("Order completed successfully");
            } catch (error) {
                reject(error);
            }
        });
    },
    placeOneOrder: (userId, addressId, item, paymentMethod ) => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalAmount = 0;
                
                    item.orderStatus = "Pending"; 
                    item.statusChangedAt = new Date(),
                    item.totalPrice = item.price 
                    totalAmount += item.price;  

                     db.get().collection(collections.BOOK_COLLECTION).updateOne(
                        { _id: item.bookId },
                        { $inc: { "bookDetails.stock": -item.stock } }
                    );
             
               
                    let items =item.bookDetails
    
                // Insert a new order for each checkout
                await db.get().collection(collections.ORDER_COLLECTION).insertOne({
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
                order.items.forEach(item => {
                      
                     db.get().collection(collections.BOOK_COLLECTION).updateOne(
                        { _id: item.bookId },
                        { $inc: { "bookDetails.stock": item.quantity } }
                    );
                });
               
               await walletHelper.addToWallet(userId,order.totalAmount);



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