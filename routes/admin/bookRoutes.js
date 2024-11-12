const express = require('express');
const router = express.Router();
const booksMngController = require('../../controllers/admin/booksMngController');


router.get('/', booksMngController.getBooks)

router.get('/add-book', booksMngController.getCategories)

router.post('/add-book', booksMngController.addBook);

router.get('/edit-book', booksMngController.editBookForm);

router.post('/edit-book', booksMngController.editBooK);

router.get('/delete-book', booksMngController.deleteBook);

router.get('/deleted-book', booksMngController.getDeletedBook);

router.get('/recover-book', booksMngController.recoverBook);

router.get('/view-book', booksMngController.viewBook);

router.get('/categories', booksMngController.getCategories);

router.get('/add-category', booksMngController.categoryForm);

router.post('/add-category', booksMngController.addCategory);

router.get('/edit-category', booksMngController.editCategoryForm);

router.post('/edit-category', booksMngController.editCategory);

router.get('/delete-category', booksMngController.deleteCaregory);

router.get('/deleted-category', booksMngController.getDeletedCategories);

router.get('/recover-category', booksMngController.recoverCategory);

router.get('/filter', booksMngController.filter)

module.exports = router;