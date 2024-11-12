const { ObjectId } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');
const { getUserCart } = require('./cartHelper');

module.exports = {
    getcoupons: ()=>{
        return new Promise(async(resolve,reject)=>{
            try {
            let coupons = await db.get().collection(collections.COUPON_COLLECTION).find().toArray();  
             resolve(coupons);
            } catch (error) {
                reject(error);
            }
        })
    },
    couponValue: (couponCode,userId)=>{

      return new Promise(async(resolve,reject)=>{
      try {
        let cart = await getUserCart(userId)
        let price = cart.totalPrice;
        let discountAmount = 0
        let newTotalPrice = price;
        let coupon = await db.get().collection(collections.COUPON_COLLECTION).findOne({coupon_code: couponCode});
        if (!coupon) {
            return resolve(price); 
        }
         
        if(coupon.discount_type === 'percentage'){
            discountAmount = coupon.discount_value / 100 * price
            newTotalPrice = price - discountAmount;
        }else if(coupon.discount_type === 'fixed_amount'){
            discountAmount = price - coupon.discount_value;
            newTotalPrice = price - discountAmount;
        }else{
            newTotalPrice = price;
            discountAmount = 0;
        }
        resolve({discountAmount,newTotalPrice});
      } catch (error) {
        reject(error);
      }
      })
    }
}