const { ObjectId } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');

module.exports = {
    getOrders: ()=>{
        return new Promise(async(resolve,reject)=>{
          try {
            let orders = await db.get().collection(collections.ORDER_COLLECTION).find().toArray();
           resolve(orders);
          } catch (error) {
            reject(error);
          }
        })
    },
    changeOrderStatus: (orderId,bookId,userId,status)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                bookId = new ObjectId(bookId);
                const result= await db.get().collection(collections.ORDER_COLLECTION).updateOne(
                    {
                        _id: new ObjectId(orderId),
                        userId: new ObjectId(userId),
                        "items.bookId": new ObjectId(bookId)
                    },
                    {
                        $set: { "items.$[item].orderStatus": status, statusChangedAt: new Date() },
                    },
                    {
                        arrayFilters: [{ "item.bookId": new ObjectId(bookId) }]
                    }
                );
                console.log(result);
                
                resolve(result);
            } catch (error) {
                reject(error);
            }
        })
    },

}