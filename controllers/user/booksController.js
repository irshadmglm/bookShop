const bookHelper = require('../../helpers/admin/bookHelper');

module.exports = {
    viewBooks: (req,res)=>{
        let bookId = req.query.bookId;
        const breadcrumbs = [
            { name: 'Home', url: '/' },
            { name: 'View Book', url: `/userbook/view-book?bookId=${bookId}` }
          ];
        bookHelper.getBook(bookId).then(async(data)=>{
            const [book, categories] = data;        
            let relatedBooks =  await bookHelper.relatedBooks(book.bookDetails.categoryId);
            bookHelper.getReviews(bookId).then((reviews)=>{
            res.render('user/viewBook',{book:book,categories:categories, reviews:reviews,breadcrumbs:breadcrumbs,relatedBooks:relatedBooks});
            })
        })
    },

    rating: (req,res)=>{
        const {stars, bookId, review} = req.body;
        let userId = req.session.user._id;
        console.log(userId,stars,bookId, review);
        
        bookHelper.rating(stars,bookId,userId, review).then((response)=>{
            res.status(200).json({ message: "Rating saved successfully!" });
            // res.redirect('/view-book')
        }).catch((err)=>{
            console.log(err);
            res.status(500).json({ message: "Error saving rating", error: err.message });
            // res.redirect('/view-book')
        })
    },

    filter: (req,res)=>{
        const { categoryId, price, sort } = req.query;
     bookHelper.filterBooks(categoryId,price, sort).then((response)=>{
       const {categories,books} = response;
       res.status(200).json({ success: true, books: response.books, categories: response.categories });
     }).catch((error)=>{
        res.status(500).json({ message: error.message || 'An unexpected error occurred' });
     })
    
    },
}