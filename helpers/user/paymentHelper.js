const { ObjectId } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');

module.exports = {
    addpayment: (data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PAYMENT_COLLECTION).insertOne(data).then((respons)=>{
                resolve()
            })

            db.get().collection(collections.ORDER_COLLECTION).findOne({})
        })
    }
}