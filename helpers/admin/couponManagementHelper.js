const { ObjectId } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');

module.exports = {
    addCoupon: (couponData) => {
        return new Promise((resolve, reject) => {
            try {
                db.get()
                    .collection(collections.COUPON_COLLECTION)
                    .insertOne(couponData)
                    .then((result) => {
                        resolve(result.insertedId);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            } catch (error) {
                reject(error); 
            }
        });
    },

    getcoupons: ()=>{
        return new Promise(async(resolve,reject)=>{
            try {
            let coupons = await db.get().collection(collections.COUPON_COLLECTION).find().toArray();  
             resolve(coupons);
            } catch (error) {
                reject(error);
            }
        })
    }
    
}