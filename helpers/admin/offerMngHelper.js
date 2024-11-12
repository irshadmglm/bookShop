const { ObjectId } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');

module.exports = {
    addOffer: (details)=>{
        return new Promise(async(resolve,reject)=>{
            try {
        await db.get().collection(collections.OFFER_COLLECTION).insertOne({details});
        discountType = details.product ?? details.category;
        if(details.offerType === 'Product'){
            await db.get().collection(collections.BOOK_COLLECTION)
            .updateOne({_id: new ObjectId(details.product)},
           {
              $set:{
                  "bookDetails.offerType": details.offerType,
                  "bookDetails.discount":details.discount 
                  }
              }
          )
        }else if(details.offerType === 'Category'){
            await db.get().collection(collections.CATEGORIES_COLLECTION)
            .updateOne({_id: new ObjectId(details.category)},
            {
                $set:{
                    discount:details.discount 
                }
            }
        )

        await db.get().collection(collections.BOOK_COLLECTION)
            .updateMany({"bookDetails.categoryId": details.category},
           {
              $set:{
                  "bookDetails.offerType": details.offerType,
                  "bookDetails.discount":details.discount 
                  }
              }
          )

        }
        
         resolve()
        } catch (error) {
              reject(error);
        }
        })
    },
    getAllOffers:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
         let offers = await db.get().collection(collections.OFFER_COLLECTION).find().toArray();
                resolve(offers);
            } catch (error) {
                reject(error);
            }
        })
    }
}