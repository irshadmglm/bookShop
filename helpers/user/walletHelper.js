const { ObjectId, serialize } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');
const { status } = require('express/lib/response');

module.exports = {
    getWallet: (userId)=>{
        return new Promise(async(resolve,reject)=>{
          let wallet = await db.get().collection(collections.WALLET_COLLECTION).findOne({userId: new ObjectId(userId)});
          resolve(wallet);
        })
    },
    addToWallet: (userId,amount)=>{
        return new Promise(async(resolve,reject)=>{

         try {
            const result = await db.get().collection(collections.WALLET_COLLECTION).updateOne(
                { userId: new ObjectId(userId) }, 
                {
                    $inc: { totalBalance: amount }, 
                    $push: {
                        data: {
                            addedAt: new Date(),
                            amount: amount,
                            type: "Refund from canceled order",
                            status: "Successful"
                        }
                    }
                },
                { upsert: true }
            );
    
                resolve()
         } catch (error) {
            reject(error)
         }
        })
    }
}