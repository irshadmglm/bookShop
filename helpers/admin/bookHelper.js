const { ObjectId, serialize } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');
const bcrypt = require('bcrypt');

module.exports = {
    addBook: function (bookDetails) {
        return new Promise(async (resolve, reject) => {
            
            try {
              let data = await this.getCategory(bookDetails.categoryId);
              bookDetails.category = data.categoryData.categoryName;
                let response = await db.get().collection(collections.BOOK_COLLECTION).insertOne({ bookDetails, createdAt: new Date() });
                resolve(response)
            } catch (error) {
                reject(error)
            }
        })
    },
    getbooks: function (categoryId) {
        return new Promise(async (resolve, reject) => {
            try {
                let books;
                if (categoryId == 0 || !categoryId) {
                    books = await db.get().collection(collections.BOOK_COLLECTION).find({ is_deleted: { $ne: true } }).toArray();
                } else {
                    books = await db.get().collection(collections.BOOK_COLLECTION).find({ is_deleted: { $ne: true }, "bookDetails.categoryId": categoryId }).toArray();
                }

                let categories = await this.getCategories();

                resolve([books, categories]);
            } catch (error) {
                reject(error);
            }
        })
    },
    getDeletedbooks: (categoryId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let books;
                if (categoryId == 0 || !categoryId) {
                    books = await db.get().collection(collections.BOOK_COLLECTION).find({ is_deleted: true }).toArray();
                } else {
                    books = await db.get().collection(collections.BOOK_COLLECTION).find({ is_deleted: true, "bookDetails.categoryId": categoryId }).toArray();
                }


                resolve(books)
            } catch (error) {
                reject(error);
            }
        })
    },
    getBook: function (bookId) {
        return new Promise(async (resolve, reject) => {
            try {
                let book = await db.get().collection(collections.BOOK_COLLECTION).findOne({ _id: new ObjectId(bookId) })
                let categories = await this.getCategories();

                resolve([book, categories]);
            } catch (error) {
                reject(error);
            }
        })
    },
    updateBook: function(bookDetails) {
        return new Promise(async (resolve, reject) => {
            let data = await this.getCategory(bookDetails.categoryId);
              bookDetails.category = data.categoryData.categoryName;
            const updateFields = {};

            for (const key in bookDetails) {
                if (bookDetails[key]) {
                    updateFields[`bookDetails.${key}`] = bookDetails[key];
                }
            }
            if (Object.keys(updateFields).length > 0) {
                await db.get().collection(collections.BOOK_COLLECTION).updateOne({ _id: new ObjectId(bookDetails.bookId) }, { $set: updateFields }).then((response) => {
                    resolve(response);
                }).catch((error) => {
                    reject(error);
                })
            }
        })
    },
    deleteBook: (bookId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collections.BOOK_COLLECTION).updateOne(
                    { _id: new ObjectId(bookId) }, { $set: { is_deleted: true, deleted_at: new Date() } }
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
                    { _id: new ObjectId(bookId) }, { $set: { is_deleted: false, deleted_at: "" } }
                );
                resolve('Book deleted successfully');
            } catch (error) {
                reject(error);
            }
        });
    },
    getCategories: function () {
        try {
            return new Promise(async (resolve, reject) => {
                let categories = await db.get().collection(collections.CATEGORIES_COLLECTION).find({ is_deleted: { $ne: true } }).toArray();
                resolve(categories);
            })
        } catch (error) {
            reject(error);
        }
    }, 
    addCategory: (categoryData) => {
        return new Promise(async (resolve, reject) => {
           let category = await db.get().collection(collections.CATEGORIES_COLLECTION).findOne({"categoryData.categoryName":categoryData.categoryName})
            if(!category){
                await db.get().collection(collections.CATEGORIES_COLLECTION).insertOne({ categoryData });
                resolve();
            }else{
                reject("category already exist");
            }
        })
    },
    getCategory: function (categoryId){
        try {
            return new Promise(async (resolve, reject) => {
                let category = await db.get().collection(collections.CATEGORIES_COLLECTION).findOne({ _id: new ObjectId(categoryId) });
                resolve(category);
            })
        } catch (error) {
            reject(error);
        }
    },
    editCategory: (categoryData) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collections.CATEGORIES_COLLECTION).updateOne({ _id: new ObjectId(categoryData.categoryId) }, {
                    $set: {
                        'categoryData.categoryName': categoryData.categoryName,
                        'categoryData.categoryDescription': categoryData.categoryDescription,
                        'categoryData.categoryStatus': categoryData.categoryStatus
                    }
                })
                resolve();
            } catch (error) {
                reject(error);
            }
        })
    },
    deleteCategory: (categoryId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collections.CATEGORIES_COLLECTION).updateOne({ _id: new ObjectId(categoryId) }, { $set: { is_deleted: true, deleted_at: new Date() } });
                resolve()
            } catch (error) {

            }
        })
    },
    getdeletedCategories: () => {
        try {
            return new Promise(async (resolve, reject) => {
                let deletedCategories = await db.get().collection(collections.CATEGORIES_COLLECTION).find({ is_deleted: true }).toArray();
                resolve(deletedCategories);
            })
        } catch (error) {
            reject(error);
        }
    },
    recoverCategory: (categoryId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.CATEGORIES_COLLECTION).updateOne({ _id: new ObjectId(categoryId) }, { $set: { is_deleted: false, deleted_at: "" } });
            resolve();
        })
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

    getReviews: (bookId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let reviews = await db.get().collection(collections.RATING_COLLECTION).aggregate([
                    {
                        $match: {
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
                        $project: {
                            _id: 1,
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
    relatedBooks: (categoryId) => {
        console.log(categoryId);

        return new Promise(async (resolve, reject) => {
            let books = await db.get().collection(collections.BOOK_COLLECTION).find({ "bookDetails.categoryId": categoryId }).toArray();
            console.log(books);

            resolve(books);
        })
    },

    filterBooks: function (categoryId, priceRange, sort) {
        return new Promise(async (resolve, reject) => {
            try {
                let pipeline = [];

                if (categoryId) {
                    pipeline.push({
                        $match: {
                            "bookDetails.categoryId": categoryId
                        }
                    });
                }

                if (priceRange) {
                    const [minPrice, maxPrice] = priceRange.split('-').map(Number);
                    pipeline.push({
                        $match: {
                            $expr: {
                                $and: [
                                    { $gte: [{ $toInt: "$bookDetails.price" }, minPrice] },
                                    { $lte: [{ $toInt: "$bookDetails.price" }, maxPrice === 201 ? Infinity : maxPrice] }
                                ]
                            }
                        }
                    });
                }

                // Add sorting based on the sort parameter
                if (sort) {
                    switch (sort) {
                        case 'popularity':
                            pipeline.push({ $sort: { popularity: -1 } });
                            break;
                        case 'price-low-high':
                            pipeline.push({ $sort: { 'bookDetails.price': 1 } });
                            break;
                        case 'price-high-low':
                            pipeline.push({ $sort: { 'bookDetails.price': -1 } });
                            break;
                        case 'average-ratings':
                            pipeline.push({ $sort: { average_rating: -1 } });
                            break;
                        case 'in-stock':
                            pipeline.push({ $match: { 'bookDetails.stock': { $gt: 0 } } });
                            break;
                         case 'new-arrivals':
                            pipeline.push({ $sort: { createdAt: -1 } }); 
                            break;
                        case 'a-z':
                            
                            pipeline.push({
                                $project: {
                                    bookDetails: 1, 
                                    lowerCaseName: { $toLower: "$bookDetails.book_name" } 
                                }
                            });
                            pipeline.push({
                                $sort: {
                                    lowerCaseName: 1 
                                }
                            });
                            break;
                        case 'z-a':
                            
                            pipeline.push({
                                $project: {
                                    bookDetails: 1,
                                    lowerCaseName: { $toLower: "$bookDetails.book_name" }
                                }
                            });
                            pipeline.push({
                                $sort: {
                                    lowerCaseName: -1 
                                }
                            });
                            break;
                        default:
                            break;
                    }
                }

                let books = await db.get().collection(collections.BOOK_COLLECTION).aggregate(pipeline).toArray();
                let categories = await this.getCategories();
                resolve({ books, categories });
            } catch (error) {
                reject(error);
            }
        });
    },
    //  bestSelling : function(type) {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             const dbInstance = db.get().collection(collections.ORDER_COLLECTION);
    
                
    //             let pipeline = [
    //                 { $unwind: "$items" },
    //                 { $match: { "items.orderStatus": "Delivered" } }
    //             ];
    
    //             if (type === "products") { 
                   
    //                 pipeline.push(
    //                     {
    //                         $group: {
    //                             _id: "$items.bookId",
    //                             bookName: { $first: "$items.bookName" },
    //                             authorName: { $first: "$items.authorName" },
    //                             totalSold: { $sum: "$items.quantity" },
                                
    //                         }
    //                     },
    //                     { $sort: { totalSold: -1 } },
    //                     { $limit: 10 }
    //                 );
    //             } else if (type === "categories") {
                    
    //                 pipeline.push(
    //                     {
    //                         $group: {
    //                             _id: "$items.category",
    //                             totalSold: { $sum: "$items.quantity" }
    //                         }
    //                     },
    //                     { $sort: { totalSold: -1 } },
    //                     { $limit: 10 }
    //                 );
    //             } else {
    //                 // Invalid type
    //                 return reject("Invalid type! Use 'products' or 'categories'.");
    //             }
    
    //             // Execute the pipeline
    //             const books = await dbInstance.aggregate(pipeline).toArray();

    //             let categories = await this.getCategories();

    //             resolve([books, categories]);
    //         } catch (error) {
    //             console.error("Error fetching best-selling data:", error);
    //             reject(error);
    //         }
    //     });
    // },
    bestSelling: function (type) {
        return new Promise(async (resolve, reject) => {
            try {
                const dbInstance = db.get().collection(collections.ORDER_COLLECTION);
                let pipeline = [
                    { $unwind: "$items" },
                    { $match: { "items.orderStatus": "Delivered" } },
                    {
                        $addFields: {
                            "items.bookId": { $toObjectId: "$items.bookId" }, // Convert bookId to ObjectId
                        }
                    }
                ];
    
                if (type === "products") {
                    pipeline.push(
                        {
                            $group: {
                                _id: "$items.bookId",
                                totalSold: { $sum: "$items.quantity" }
                            }
                        },
                        {
                            $lookup: {
                                from: "books",
                                localField: "_id",
                                foreignField: "_id",
                                as: "bookDetails"
                            }
                        },
                        { $unwind: "$bookDetails" }, // Flatten bookDetails array
                        {
                            $replaceRoot: {
                                newRoot: {
                                    _id: "$_id",
                                    totalSold: "$totalSold",
                                    bookDetails: "$bookDetails.bookDetails", // Access nested bookDetails
                                    bookMeta: {
                                        average_rating: "$bookDetails.average_rating",
                                        total_ratings: "$bookDetails.total_ratings",
                                        rating_sum: "$bookDetails.rating_sum"
                                    }
                                }
                            }
                        },
                        { $sort: { totalSold: -1 } },
                        { $limit: 10 }
                    );
    
                    // Execute pipeline for products
                    const books = await dbInstance.aggregate(pipeline).toArray();
                    console.log("Top 10 Best-Selling Products: ", books);
                    let categories = await this.getCategories();

                 
                    return resolve([books, categories]);
                } else if (type === "categories") {
                    pipeline.push(
                        {
                            $group: {
                                _id: "$items.category", // Group by category
                                totalSold: { $sum: "$items.quantity" }
                            }
                        },
                        { $sort: { totalSold: -1 } },
                        { $limit: 10 },
                        {
                            $lookup: {
                                from: "categories", // Join with categories collection
                                localField: "_id",
                                foreignField: "categoryData.categoryName",
                                as: "categoryData"
                            }
                        },

                        {
                            $project: {
                                _id: 1,
                                totalSold: 1,
                                categoryData: 1
                                
                            
                            }
                        }
                    )
    
                    // Execute pipeline for categories
                    const category = await db
                        .get()
                        .collection(collections.ORDER_COLLECTION)
                        .aggregate(pipeline)
                        .toArray();
    
                    console.log("Top 10 Best-Selling Categories: ", category);
                    return resolve(category);
                } else {
                    return reject("Invalid type! Use 'products' or 'categories'.");
                }
            } catch (error) {
                console.error("Error fetching best-selling data:", error);
                reject(error);
            }
        });
    }
    
    

}
