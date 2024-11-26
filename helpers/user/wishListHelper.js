const { ObjectId, serialize } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');



module.exports = {
    addToWishlist: (bookId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let wishList = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({ userId: new ObjectId(userId) });
            if (wishList) {
               await db.get().collection(collections.WISHLIST_COLLECTION)
                    .updateOne({ userId: new ObjectId(userId) },
                        {
                            $push: {
                                books: {
                                    bookId: new ObjectId(bookId),
                                    added_at: new Date()
                                }
                            }
                        }
                    )
            } else {
               await db.get().collection(collections.WISHLIST_COLLECTION)
               await db.get().collection(collections.WISHLIST_COLLECTION)
               .insertOne({
                   userId: new ObjectId(userId),
                   books: [
                       {
                           bookId: new ObjectId(bookId),
                           added_at: new Date()
                       }
                   ]
               });
           
            }
            resolve()
            } catch (error) {
                reject(error);
            }
        })
    },
    getWishlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const wishlist = await db.get().collection(collections.WISHLIST_COLLECTION).aggregate([
                    {
                        $match: { 
                            userId: new ObjectId(userId) 
                        }
                    },
                    {
                        $unwind: "$books" 
                    },
                    {
                        $lookup: {
                            from: "books",                  
                            localField: "books.bookId",    
                            foreignField: "_id",           
                            as: "bookDetails"               
                        }
                    },
                    {
                        $unwind: "$bookDetails"
                    },
                    {
                        $replaceRoot: { newRoot: "$bookDetails.bookDetails" }
                    }
                   
                ]).toArray(); 
                
                resolve(wishlist); 
            } catch (error) {
                reject(error); 
            }
        });
    },
    removeFromWishlist: (bookId, userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get()
                    .collection(collections.WISHLIST_COLLECTION)
                    .updateOne(
                        { userId: new ObjectId(userId) },  
                        { $pull: { books: { bookId: new ObjectId(bookId) } } } 
                    )
                    .then((response) => {
                        resolve(response);  
                    })
                    .catch((error) => {
                        reject(error); 
                    });
            } catch (error) {
                reject(error);  
            }
        });
    },
    getWishlistIds:(userId)=>{
        return new Promise(async(resolve,reject)=>{
          let wishList = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({userId: new ObjectId(userId)})
         if(wishList){
            resolve(wishList.books);
         }
        })
    }
    
    
}