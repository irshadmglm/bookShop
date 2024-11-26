const { ObjectId } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');
const { getCategory } = require('../admin/bookHelper');

module.exports = {
  getUserCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {

        const userCart = await db.get().collection(collections.USER_CART_COLLECTION).aggregate([
          {
            $match: { userId: new ObjectId(userId), status: "active" }
          },
          {
            $unwind: "$items"
          },
          {
            $lookup: {
              from: collections.BOOK_COLLECTION,
              localField: "items.bookId",
              foreignField: "_id",
              as: "bookDetails"
            }
          },
          {
            $unwind: "$bookDetails"
          },
          {
            $group: {
              _id: "$_id",
              userId: { $first: "$userId" },
              createdAt: { $first: "$createdAt" },
              updatedAt: { $first: "$updatedAt" },
              totalQuantity: { $first: "$totalQuantity" },
              totalPrice: { $first: "$totalPrice" },
              totalDiscount: { $first: "$totalDiscount" },
              couponDeduction: { $first: "$couponDeduction" },
              items: {
                $push: {
                  bookId: "$items.bookId",
                  bookName: "$items.bookName",
                  authorName: "$items.authorName",
                  category: "$items.category",
                  price: "$items.price",
                  actualPrice: "$items.actualPrice",
                  coverImageName: "$items.coverImageName",
                  quantity: "$items.quantity",
                  subtotal: "$items.subtotal",
                  stockCount: "$items.stockCount",
                  discountValue: "$items.discountValue"
                }
              }
            }
          }
        ]).toArray();



        resolve(userCart[0] || null);
      } catch (error) {
        reject(error);
      }
    });
  },
  addToCart: (bookId, userId) => {
    
    return new Promise(async (resolve, reject) => {
      try {
        const bookDetails = await db.get().collection(collections.BOOK_COLLECTION).findOne({
          _id: new ObjectId(bookId),
          is_deleted: { $ne: true },
          'bookDetails.stock': {$gt : 0}
        });

        if (!bookDetails) {
          console.log("This Book not available");
         return reject("This Book not available");
        }
        const { book_name, categoryId, author_name, price, coverImageName, stock, discount = 0 } = bookDetails.bookDetails;
        const categorydetails = await getCategory(categoryId);
        const category = categorydetails.categoryData.categoryName;
        const actualPrice = parseFloat(price)
        const discountValue = (actualPrice * discount /100);
        const bookPrice = discount  ? actualPrice - discountValue : actualPrice;

        console.log(actualPrice, discountValue, bookPrice ,discount);

        stockCount = parseInt(stock);

        const userCart = await db.get().collection(collections.USER_CART_COLLECTION).findOne(
          { userId: new ObjectId(userId), "items.bookId": new ObjectId(bookId), status: "active" }
        );
  
        
        const item = userCart?.items?.find(i => i.bookId.toString() === bookId.toString());
        if (item && item.quantity >= stockCount) {
          return reject("Cannot add more of this book to the cart; exceeds available stock");
        }
        const maxQtyPerPerson = 5; 
            if ( item && item.quantity >= maxQtyPerPerson) {
               reject(`You can only add up to ${maxQtyPerPerson} units of this product to your cart`);
               return true; 
            }


        let cart = await db.get().collection(collections.USER_CART_COLLECTION).updateOne(
          { userId: new ObjectId(userId), "items.bookId": new ObjectId(bookId), "status": "active" , "items.quantity": { $lt: stockCount } },
          {
            $inc: { "items.$.quantity": 1,
                   "items.$.subtotal": bookPrice,
                    "items.$.actualPrice": actualPrice,
                    "items.$.price": actualPrice,
                    "items.$.discountValue": discountValue,
                    totalQuantity: 1,
                    totalPrice: bookPrice,
                    totalDiscount: discountValue
                  },
            $set: { updatedAt: new Date() }
          }
        )

        if (cart.matchedCount === 0) {
          await db.get().collection(collections.USER_CART_COLLECTION).updateOne(
            { userId: new ObjectId(userId), status: "active", },
            {
              $setOnInsert: { createdAt: new Date() },
              $set: { updatedAt: new Date() },
              $inc: { totalQuantity: 1, totalPrice: bookPrice, totalDiscount: discountValue },
              $addToSet: {
                items: {
                  bookId: new ObjectId(bookId),
                  bookName: book_name,
                  authorName: author_name,
                  category: category,
                  coverImageName: coverImageName,
                  quantity: 1,
                  subtotal: bookPrice,
                  stockCount: stockCount,
                  actualPrice: actualPrice,
                  price: actualPrice,
                  discountValue: discountValue
                }
              }
            },
            { upsert: true }
          );
        }
        resolve("Book added to cart successfully");


      } catch (error) {
        reject(error.message);
      }
    });
  },
  removeFromCart: function(bookId, userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const userCart = await db.get().collection(collections.USER_CART_COLLECTION).findOne(
          { userId: new ObjectId(userId), status: "active" }
        );
        if (!userCart) {
          return reject("Cart not found for the user.");
        }

        const itemToRemove = userCart.items.find(item => item.bookId.equals(new ObjectId(bookId)));
        if (!itemToRemove) {
          return reject("Item not found in cart.");
        }

        await db.get().collection(collections.USER_CART_COLLECTION).updateOne(
          { userId: new ObjectId(userId), status: "active" },
          {
            $pull: { items: { bookId: new ObjectId(bookId) } },
            $inc: {
              totalQuantity: -itemToRemove.quantity,
              totalPrice: -itemToRemove.subtotal,
              totalDiscount: - itemToRemove.discountValue
            },
            $set: { updatedAt: new Date() }
          }
        );
        await db.get().collection(collections.USER_CART_COLLECTION).deleteOne({ items: { $size: 0 } });

        resolve("Item removed from cart successfully");
      } catch (error) {
        reject(error);
      }
    });
  },
  changeQuantity: function (count, bookId, userId){
    return new Promise(async (resolve, reject) => {
      try {
        const bookDetails = await db.get().collection(collections.BOOK_COLLECTION).findOne({
          _id: new ObjectId(bookId),
          is_deleted: { $ne: true }
        });
  
        if (!bookDetails) {
          return reject("Book not found or has been deleted");
        }
  
        let { price, stock, discount = 0 } = bookDetails.bookDetails;
        const actualPrice = parseFloat(price)
        let discountValue = (actualPrice * discount /100);
        let bookPrice = discount  ? actualPrice - discountValue : actualPrice;
        console.log(actualPrice, discountValue, bookPrice);
        
        if (count < 0) {
          bookPrice = -bookPrice;
          discountValue = -discountValue
        }
  
        stock = Number(stock);
  
        // Fetch user cart with specified bookId and active status
        const cart = await db.get().collection(collections.USER_CART_COLLECTION).findOne({
          userId: new ObjectId(userId),
          "items.bookId": new ObjectId(bookId),
          "status": "active"
        });
  
        if (!cart) {
          return reject("Cart or item not found");
        }
  

        const hasSufficientStock = cart.items.some((item) => {
          if (item.bookId.equals(new ObjectId(bookId))) {

            if (item.quantity + count > stock) {
              reject("Not enough stock");
              return true;  
            }
            if (item.quantity + count <= 0) {
               this.removeFromCart(bookId,userId).then((message)=>{
                resolve(message);
               })
              return true;  
            }
            const maxQtyPerPerson = 5; 
            if (count + item.quantity > maxQtyPerPerson) {
               reject(`You can only add up to ${maxQtyPerPerson} units of this product to your cart`);
               return true; 
            }

            

          }
          return false;
        });
  
        if (hasSufficientStock) return;

        // Proceed with updating the cart quantities and subtotal
        await db.get().collection(collections.USER_CART_COLLECTION).updateOne(
          { userId: new ObjectId(userId), "items.bookId": new ObjectId(bookId), "status": "active" },
          {
            $inc: { 
              "items.$.quantity": count, 
              "items.$.subtotal": bookPrice, 
              "items.$.actualPrice": actualPrice, 
              totalQuantity: count, 
              totalPrice: bookPrice,
              totalDiscount: discountValue
            },
            $set: { updatedAt: new Date() }
          }
        );
  
        resolve("Quantity changed");
      } catch (error) {
        reject("An error occurred: " + error.message);
      }
    });
  }
  

}