const { ObjectId, serialize } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');
const { getCategories } = require('../admin/bookHelper');
const bookHelper = require('../admin/bookHelper');

module.exports = {
    getBooks: function (categoryId, page = 1, limit = 10, priceRange = null, sort = null) {
        return new Promise(async (resolve, reject) => {
            try {
                let pipeline = [];
                const skip = (page - 1) * limit;
    
                // Match books that are not deleted
                pipeline.push({
                    $match: {
                        is_deleted: { $ne: true }
                    }
                });
    
                // Filter by category if categoryId is provided and valid
                if (categoryId && categoryId !== 0) {
                    pipeline.push({
                        $match: {
                            "bookDetails.categoryId": categoryId
                        }
                    });
                }
    
                // Filter by price range if provided
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
                            pipeline.push({ $sort: { lowerCaseName: 1 } });
                            break;
                        case 'z-a':
                            pipeline.push({
                                $project: {
                                    bookDetails: 1,
                                    lowerCaseName: { $toLower: "$bookDetails.book_name" }
                                }
                            });
                            pipeline.push({ $sort: { lowerCaseName: -1 } });
                            break;
                        default:
                            break;
                    }
                } 
    
                // Count total filtered books for pagination
                const totalBooksResult = await db.get()
                    .collection(collections.BOOK_COLLECTION)
                    .aggregate([...pipeline, { $count: "total" }])
                    .toArray();
                const totalBooks = totalBooksResult.length ? totalBooksResult[0].total : 0;
                const totalPages = Math.ceil(totalBooks / limit);
    
                // Pagination
                pipeline.push({ $skip: skip });
                pipeline.push({ $limit: limit });
    
                // Execute the pipeline to get the paginated and filtered books
                let books = await db.get()
                    .collection(collections.BOOK_COLLECTION)
                    .aggregate(pipeline)
                    .toArray();
    
                // Get categories (assuming getCategories is defined elsewhere in your code)
                let categories = await bookHelper.getCategories();
                console.log(books);
                
                resolve({ books, categories, totalPages, currentPage: page });
            } catch (error) {
                reject(error);
            }
        });
    },
    search:function (query){
        return new Promise(async(resolve,reject)=>{
          try {
            let books =  await db.get().collection(collections.BOOK_COLLECTION).find(
                { "bookDetails.book_name": { $regex: query, $options: "i" }}
                ).toArray();
                let categories = await bookHelper.getCategories();
                resolve({books, categories});
          } catch (error) {
            reject(error);
          }
        })
    }
}