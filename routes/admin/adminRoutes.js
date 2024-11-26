const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');

router.get('/',adminController.checkAuth,(req,res)=>{  res.redirect('/admin/books')})

router.post('/login',adminController.login)

router.get('/logout',adminController.logOut)

router.get('/add-book',(req,res)=>{ res.render('admin/addBook')});

router.post('/add-book', adminController.addBook);

module.exports = router;