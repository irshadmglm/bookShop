const bookHelper = require('../../helpers/admin/bookHelper');
const multer = require('multer');
const path = require('path');
const { error } = require('console');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/images/uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

module.exports = {
    getBooks: (req, res) => {
        categoryId = req.query.categoryId;
        console.log(categoryId);
    
        bookHelper.getbooks(categoryId).then((data) => {
            const [books, categories] = data;
            res.render('admin/books', { books: books, categories: categories });
        }).catch((error) => {
            console.log(error);
        })
    },

    getCategories: (req, res) => {
        bookHelper.getCategories().then((categories) => {
            res.render('admin/addBook', { categories: categories });
        })
    
    },

    addBook:(req, res, next) => {
        upload.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'back_image', maxCount: 1 }, { name: 'content_image', maxCount: 1 }])(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                console.error('Multer error:', err);
                return res.status(400).send({ message: 'File upload error: ' + err.message });
            } else if (err) {
                console.error('Error:', err);
                return res.status(500).send({ message: 'File upload error: ' + err.message });
            }
    
            // Proceed with the request if no errors occurred
            console.log(req.body); // Form data
            console.log(req.files); // Uploaded files 
    
            bookHelper.addBook(req.body).then((response) => {
                console.log(response);
                res.redirect('/books');
            }).catch((error) => {
                console.log(error);
                res.redirect('/books/add-book');
            });
        });
    },

    editBookForm: (req, res) => {
        let bookId = req.query.bookId;
        bookHelper.getBook(bookId).then((data) => {
            const [book, categories] = data;
            res.render('admin/editBook', { book: book, categories: categories })
        }).catch((error) => {
            console.log(error);
    
        })
    },

    editBooK: (req, res, next) => {
        upload.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'back_image', maxCount: 1 }, { name: 'content_image', maxCount: 1 }])(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                console.error('Multer error:', err);
                return res.status(400).send({ message: 'File upload error: ' + err.message });
            } else if (err) {
                console.error('Error:', err);
                return res.status(500).send({ message: 'File upload error: ' + err.message });
            }
            console.log(req.files);
            let strstock = req.body.stock;
            req.body.stock = parseInt(strstock);
            bookHelper.updateBook(req.body).then((response) => {
                console.log(req.body);
    
                res.redirect('/books')
            }).catch((error) => {
                res.redirect('/books')
            })
        });
    },

    deleteBook: (req, res) => {
        bookHelper.deleteBook(req.query.bookId).then((response) => {
            res.redirect('/books');
        }).catch((error) => {
            res.redirect('/books')
        })
    },

    getDeletedBook: (req, res) => {
        bookHelper.getDeletedbooks().then((books) => {
            res.render('admin/deletedBooks', { books: books })
        })
    },

    recoverBook: (req, res) => {
        bookHelper.recoverBook(req.query.bookId).then((response) => {
            res.redirect('/books/deleted-book');
        }).catch((err) => {
            console.log(err);
            res.redirect('/books/deleted-book');
        })
    },

    viewBook: (req, res) => {
        bookHelper.getBook(req.query.bookId).then((response) => {
            const [book, categories] = response;
            res.render('admin/viewBook', { book: book, categories: categories });
        }).catch((err) => {
            console.log(err);
            res.redirect('/books');
    
        })
    },

    getCategories: (req, res) => {
        bookHelper.getCategories().then((categories) => {
            console.log(categories);
    
            res.render('admin/categories', { categories: categories });
        }).catch((err) => {
            console.log(err);
    
        })
    },

    categoryForm: (req, res) => {
        res.render('admin/addCategories')
    },

    addCategory: (req, res) => {
        bookHelper.addCategory(req.body).then((response) => {
            res.redirect('/books/categories');
        }).catch((error) => {
            console.log(error);
            res.redirect('/books/add-category');
    
        })
    },

    editCategoryForm: (req, res) => {
        bookHelper.getCategory(req.query.categoryId).then((category) => {
            res.render('admin/editCategory', { category: category })
        }).catch((err) => {
            console.log(err);
    
        })
    },

    editCategory: (req, res) => {
        bookHelper.editCategory(req.body).then((response) => {
            res.redirect('/books/categories');
        }).catch((err) => {
            console.log(err);
            res.redirect('/books/categories');
        })
    },

    deleteCaregory: (req, res) => {
        bookHelper.deleteCategory(req.query.categoryId).then(() => {
            res.redirect('/books/categories');
        })
    },

    getDeletedCategories: (req, res) => {
        bookHelper.getdeletedCategories().then((categories) => {
            console.log(categories);
    
            res.render('admin/deletedCategories', { categories: categories })
        })
    },

 recoverCategory: (req, res) => {
    bookHelper.recoverCategory(req.query.categoryId).then(() => {
        res.redirect('/books/deleted-category')
    })
},

filter: (req, res) => {
    bookHelper.filterBooks(req.query.categoryId, req.query.price).then((response) => {
        const [books, categories] = response;
        res.render('user/userHome', { books: books, categories: categories })
    })
}

}