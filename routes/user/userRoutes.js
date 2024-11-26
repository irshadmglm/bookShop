const express = require('express');
const userHelper = require('../../helpers/user/userHelper');
const bookHelper = require('../../helpers/admin/bookHelper');
const { redirect, render } = require('express/lib/response');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userController = require('../../controllers/user/userController');
const booksController = require('../../controllers/user/booksController');
const { checkAuth } = require('../../middlewares/middlewares');
const router = express.Router();
require('../../middlewares/auth')


// router.get('/', userController.checkAuth, userController.home);
router.get('/', checkAuth, booksController.viewBooks);

router.get('/signup', checkAuth, (req, res) => { res.render('user/signUp', { message: '' })})

router.post('/signup', userController.signUp);

router.post('/verify-otp', userController.verifyOtp);

router.get('/resend-otp', userController.resendOtp);

router.post('/login', userController.login);

router.get('/logout', userController.logOut);

// router.get('/auth/google', userController.googleAuth);

// // Google Authentication Callback
// router.get('/auth/google/callback', userController.authCallback);

router.get('/profile', checkAuth, userController.profile);

router.get('/edit-user', checkAuth, (req,res)=>{ res.render('user/editUser',{user:req.session.user})});

router.post('/edit-user', checkAuth, userController.editUser);

router.get('/add-address', checkAuth, (req,res)=>{ res.render('user/addAddress')})

router.post('/add-address', checkAuth, userController.addAddress);

router.get('/edit-address', checkAuth, userController.getOneAddress);

router.post('/edit-address', checkAuth, userController.editAddress);

router.get('/delete-address', checkAuth, userController.deleteAddress);

router.get('/forgot-password', (req,res)=>{ res.render('user/forgotPassword')})

router.post('/forgot-password', userController.forgetPassword);

router.get('/reset-password',  userController.getResetPassword);

router.post('/reset-password', userController.postResetPassword);

router.get('/change-password', checkAuth, (req,res)=>{ res.render('user/changePassword')})

router.post('/change-password', checkAuth, userController.changePassword);


module.exports = router;
