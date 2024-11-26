const bookHelper = require('../../helpers/admin/bookHelper');
const userBookHelper = require('../../helpers/user/userBookHelper');
module.exports = {
    viewBooks: async (req, res) => {
        const { categoryId, price, sort } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = 10; 
    
        try {
            const { books, categories, totalPages, currentPage } = await userBookHelper.getBooks(categoryId, page, limit, price, sort);
    
            const breadcrumbs = [
                { name: 'Home', url: '/user' },
                // { name: 'View Book', url: `/userbook/view-book?bookId=${req.query.bookId}` }
            ];
    
            res.render('user/userhome', {
                books,
                categories,
                totalPages,
                currentPage,
                breadcrumbs
            });
        } catch (error) {
            console.log(error);
            
            res.status(500).send("An error occurred.");
        }
    },
    viewBook: (req,res)=>{
        let bookId = req.query.bookId;
        const breadcrumbs = [
            { name: 'Home', url: '/' },
            { name: 'View Book', url: `/userbooks/view-book?bookId=${bookId}` }
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

    filter: async (req,res)=>{
        const { categoryId, price, sort } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = 10; 
        userBookHelper.getBooks(categoryId, page, limit, price, sort).then(({ books, categories, totalPages, currentPage })=>{
       res.status(200).json({ success: true, books, categories, totalPages, currentPage });
     }).catch((error)=>{
        res.status(500).json({ message: error.message || 'An unexpected error occurred' });
     })
    },

    search: async (req, res) => {
        try {
            const query = req.query.q?.toLowerCase() || "";
            if (!query) {
                return res.status(400).json({ error: "Query parameter 'q' is required." });
            }
            const books = await userBookHelper.search(query);
            res.status(200).json({ success: true, books });
        } catch (error) {
            console.error("Error in search controller:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
    }
    
}
}