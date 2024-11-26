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
        let couponDeduction = 0
        let newTotalPrice = price;
        let coupon = await db.get().collection(collections.COUPON_COLLECTION).findOne({coupon_code: couponCode});
        if (!coupon ) {
            return resolve(price); 
        }
        if (price < coupon.min_purchase) {
            throw new Error("Price does not meet the minimum purchase requirement.");
        }
        
        if(coupon.discount_type === 'percentage'){
            couponDeduction = coupon.discount_value / 100 * price
            newTotalPrice = price - couponDeduction;
        }else if(coupon.discount_type === 'fixed_amount'){
            newTotalPrice = price - coupon.discount_value;
            couponDeduction = coupon.discount_value;
        }else{
            newTotalPrice = price;
            couponDeduction = 0;
        }
        couponDeduction = parseFloat(couponDeduction);
        console.log("couponDeduction", couponDeduction);
        
       await db.get().collection(collections.USER_CART_COLLECTION).updateOne({userId: new ObjectId(userId)}, {$set:{couponDeduction: couponDeduction}})
        resolve({couponDeduction,newTotalPrice});
      } catch (error) {
        reject(error);
      }
      })
    }
}