const { ObjectId, serialize } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');
const bcrypt = require('bcrypt');

module.exports = {
     addBook: (bookDetails)=>{
        return new Promise(async (resolve,reject)=>{
            try {
           let response = await db.get().collection(collections.BOOK_COLLECTION).insertOne({bookDetails});
           resolve(response)
            } catch (error) {
                reject(error)
            }
        })
     },
     getbooks: function (categoryId){
        return new Promise(async(resolve,reject)=>{
            try {
                let books;
                if(categoryId == 0 || !categoryId){
                    books = await db.get().collection(collections.BOOK_COLLECTION).find({is_deleted:{$ne: true}}).toArray(); 
                }else{
                    books = await db.get().collection(collections.BOOK_COLLECTION).find({is_deleted:{$ne: true},"bookDetails.categoryId":categoryId}).toArray(); 
                }
             
               let categories = await this.getCategories();
          
                resolve([books,categories]);
            } catch (error) { 
               reject(error); 
            }
        })
     },
     getDeletedbooks: (categoryId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let books;
                if(categoryId == 0 || !categoryId){
                    books = await db.get().collection(collections.BOOK_COLLECTION).find({is_deleted: true}).toArray(); 
                }else{
                    books = await db.get().collection(collections.BOOK_COLLECTION).find({is_deleted: true,"bookDetails.categoryId":categoryId}).toArray(); 
                }
             
    
                resolve(books)
            } catch (error) { 
               reject(error); 
            }
        })
     },
     getBook: function (bookId){ 
        return new Promise(async(resolve,reject)=>{
            try {
                let book = await db.get().collection(collections.BOOK_COLLECTION).findOne({_id:new ObjectId(bookId)})
               let categories = await this.getCategories();
            
                resolve([book,categories]);
            } catch (error) {
                reject(error);
            }
        })
     },
     updateBook:(bookDetails)=>{
        return new Promise(async(resolve,reject)=>{

            const updateFields = {};

            for (const key in bookDetails) {
                if (bookDetails[key]) { 
                    updateFields[`bookDetails.${key}`] = bookDetails[key]; 
                }
            }
            if (Object.keys(updateFields).length > 0) {
                await db.get().collection(collections.BOOK_COLLECTION).updateOne({_id: new ObjectId(bookDetails.bookId)},{$set:updateFields}).then((response)=>{
                    resolve(response);
                }).catch((error)=>{
                    reject(error);
                })
            }
        })
     },
     deleteBook: (bookId) => {
        return new Promise(async (resolve, reject) => {
          try {
            await db.get().collection(collections.BOOK_COLLECTION).updateOne(
              { _id: new ObjectId(bookId) },{ $set:{ is_deleted: true, deleted_at: new Date()} }
            );
            resolve('Book deleted successfully');
          } catch (error) {
            reject(error);
          }
        });
      },
        recoverBook: (bookId) => {
        return new Promise(async (resolve, reject) => {
          try {
            await db.get().collection(collections.BOOK_COLLECTION).updateOne(
              { _id: new ObjectId(bookId) },{ $set:{ is_deleted: false, deleted_at: ""} }
            );
            resolve('Book deleted successfully');
          } catch (error) {
            reject(error);
          }
        });
      },
      getCategories: function(){
        try {
            return new Promise(async(resolve,reject)=>{
                let categories = await db.get().collection(collections.CATEGORIES_COLLECTION).find({is_deleted:{$ne: true}}).toArray();
                resolve(categories);
             })
        } catch (error) {
            reject(error);
        }
      },
      addCategory:(categoryData)=>{
        return new Promise(async(resolve,reject)=>{
           await db.get().collection(collections.CATEGORIES_COLLECTION).insertOne({categoryData});
           resolve();
        })
      },
      getCategory:(categoryId)=>{
      try {
        return new Promise(async(resolve,reject)=>{
            let category = await db.get().collection(collections.CATEGORIES_COLLECTION).findOne({_id: new ObjectId(categoryId)});
            resolve(category);
         })
      } catch (error) {
        reject(error);
      }
      },
      editCategory:(categoryData)=>{
        return new Promise(async(resolve,reject)=>{
           try {
            await db.get().collection(collections.CATEGORIES_COLLECTION).updateOne({_id: new ObjectId(categoryData.categoryId)},{$set: {
                'categoryData.categoryName': categoryData.categoryName,
                'categoryData.categoryDescription': categoryData.categoryDescription,
                'categoryData.categoryStatus': categoryData.categoryStatus
            }})
            resolve();
           } catch (error) {
            reject(error);
           }
        })
      },
      deleteCategory:(categoryId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                await db.get().collection(collections.CATEGORIES_COLLECTION).updateOne({ _id: new ObjectId(categoryId) },{ $set:{ is_deleted: true, deleted_at: new Date()} });
                resolve()
            } catch (error) {
                
            }
        })
      },
      getdeletedCategories:()=>{
       try {
        return new Promise(async(resolve,reject)=>{
            let deletedCategories = await db.get().collection(collections.CATEGORIES_COLLECTION).find({is_deleted: true}).toArray();
            resolve(deletedCategories);
          })
       } catch (error) {
        reject(error);
       }
      },
      recoverCategory:(categoryId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collections.CATEGORIES_COLLECTION).updateOne({_id: new ObjectId(categoryId)},{$set:{is_deleted: false, deleted_at: ""}});
            resolve();
        })
      },
      filterBooks: function(categoryId, priceRange){
        return new Promise(async (resolve, reject) => {
            try {
                let priceFilter = {};
                if (priceRange) {
                    const [minPrice, maxPrice] = priceRange.split('-');
                    if (maxPrice) {
                        // Price range with upper limit
                        priceFilter = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
                    } else {
                        // Price range without upper limit (e.g., 201+)
                        priceFilter = { $gte: parseInt(minPrice) };
                    }
                }
    
                let query = [
                    { $match: { is_deleted: { $ne: true } } }, // Exclude deleted books
                    { $match: { "bookDetails.price": priceFilter } }, // Filter by price
                ];
    
                // If a categoryId is provided, add it to the query
                if (categoryId && categoryId !== '0') {
                    query.push({ $match: { "bookDetails.categoryId": categoryId } });
                }
    
                // Aggregate the filtered results
                let books = await db.get().collection(collections.BOOK_COLLECTION).aggregate(query).toArray();
                let categories = await this.getCategories();
                resolve([books,categories]);
            } catch (error) {
                reject(error);
            }
        });
    },

    rating: (stars, bookId, userId, review) => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 1;
                const bookObjectId = new ObjectId(bookId);
                const userObjectId = new ObjectId(userId);
    
                // Check if the user has already rated the book
                let rated = await db.get().collection(collections.RATING_COLLECTION).findOne({ book_id: bookObjectId, user_id: userObjectId });
                
                if (rated) {
                    console.log('Found rating:', rated);
                    // Calculate the difference between the new and old ratings
                    let starsToUpdate = stars - rated.rating;
    
                    // Update the user's rating and review
                    await db.get().collection(collections.RATING_COLLECTION).updateOne(
                        { _id: rated._id },
                        { 
                            $set: { 
                                rating: stars, 
                                review: review, 
                                timestamp: new Date().toISOString() 
                            } 
                        }
                    );
    
                    // Adjust stars to update
                    stars = starsToUpdate; 
                    count = 0; // No new rating is added
                } else {
                    // Insert new rating if not already rated
                    await db.get().collection(collections.RATING_COLLECTION).insertOne({
                        user_id: userObjectId,
                        book_id: bookObjectId,
                        rating: stars,
                        review: review,
                        timestamp: new Date().toISOString()
                    });
                }
    
                // Get the current book details
                let book = await db.get().collection(collections.BOOK_COLLECTION).findOne({ _id: bookObjectId });
                
                if (!book) {
                    return reject(new Error('Book not found'));
                }
    
                // Update book ratings: total ratings and sum
                let newTotalRatings = book.total_ratings + count;
                let newRatingSum = book.rating_sum + stars;
                let averageRating = newTotalRatings > 0 ? newRatingSum / newTotalRatings : 0;
    
                // Use $inc for concurrency safety to update book ratings
                await db.get().collection(collections.BOOK_COLLECTION).updateOne(
                    { _id: bookObjectId },
                    {
                        $set: { average_rating: averageRating },
                        $inc: { total_ratings: count, rating_sum: stars }
                    }
                );
    
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

getReviews:(bookId)=>{
    return new Promise(async(resolve,reject)=>{
       try {
        let reviews = await db.get().collection(collections.RATING_COLLECTION).aggregate([
            {
                $match:{
                    book_id: new ObjectId(bookId)
                }
            },
            {
                $lookup: {
                    from: collections.USER_COLLECTION,
                    localField: 'user_id',             
                    foreignField: '_id',              
                    as: 'user'                          
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project:{
                    _id:1,
                    user_id: 1,
                    book_id: 1,
                    rating: 1,
                    review: 1,
                    userName: '$user.name'
                }
            }
        ]).toArray();


        // let reviews = await db.get().collection(collections.RATING_COLLECTION).find({book_id: new ObjectId(bookId)}).toArray();
        console.log(reviews);
        
        resolve(reviews);
       } catch (error) {
        reject(error);
       }
     })
},
relatedBooks:(categoryId)=>{
    console.log(categoryId);
    
    return new Promise(async(resolve,reject)=>{
      let books = await db.get().collection(collections.BOOK_COLLECTION).find({"bookDetails.categoryId": categoryId}).toArray();
      console.log(books);
      
      resolve(books);
    })
}
    }
 