const userHelper = require('../../helpers/user/userHelper');
const bookHelper = require('../../helpers/admin/bookHelper');
const { redirect, render } = require('express/lib/response');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userController = require('../../controllers/user/userController');
require('../../middlewares/auth')
const passport = require('passport');


module.exports = {
     signUp: (req, res) => {
        req.session.temp = req.body;
        let otp = Math.floor(1000 + Math.random() * 9000);
        console.log(otp);
    
        req.session.otp = otp;
        req.session.otpExpiresAt = Date.now() + 2000;
        if (req.session.otp && Date.now() < req.session.otpExpiresAt) {
        } else {
            delete req.session.otp;
            delete req.session.otpExpiresAt;
        }
        userHelper.sendOtp(req.body, otp).then(() => {
            res.render('user/otp', { message: "" });
        }).catch((error) => {
            console.log(error);
    
            res.render('user/signUp', { message: error.message });
        });
    
    },
    verifyOtp: (req, res) => {
        let enteredOtp = req.body.otp.join('');
        console.log(enteredOtp);
    
        if (req.session.otp && req.session.otp.toString() === enteredOtp) {
    
            userHelper.doSignup(req.session.temp).then((response) => {
                if (response.status) {
                    req.session.user = response.user;
                    req.session.logedIn = true;
                    res.redirect('/');
                }
            }).catch((error) => {
                res.render('user/signUp', { message: error.message });
            })
        } else {
            res.render('user/otp', { message: "invalid otp" });
        }
    },
    resendOtp: (req, res) => {
        let otp = Math.floor(1000 + Math.random() * 9000);
        req.session.otp = otp;
        userHelper.sendOtp(req.session.temp, otp).then(() => {
            res.render('user/otp', { message: "" });
        }).catch((error) => {
            console.log(error);
    
            res.render('user/signUp', { message: error.message });
        });
    },
    login: (req, res) => {
        userHelper.doLogin(req.body).then((response) => {
            if (response.status) {
                req.session.user = response.user;
                req.session.logedIn = true;
            }
            res.redirect('/');
        }).catch((error) => {
            res.render('user/login', { message: error.message })
        })
    },

    logOut: (req, res) => {
        req.session.destroy();
        res.redirect('/');
    },
    googleAuth: passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
      }),
    
      // Handles Google Authentication Callback
      authCallback: [
        passport.authenticate('google', {
          failureRedirect: '/signup'
        }),
        (req, res) => {
          if (req.user && req.user.isBlocked) {
            res.render('user/login', { message: "User is blocked" });
          } else {
            console.log('Authenticated user:', req.user);
                req.session.user = req.user;
                req.session.logedIn = true;
                res.redirect('/');
          }
        }
      ],
    home: (req, res) => {
        bookHelper.getbooks().then((response) => {
            const [books, categories] = response;
            const breadcrumbs = [{ name: 'Home', url: '/' }];
            res.render('user/userhome', { books: books, categories: categories, breadcrumbs: breadcrumbs })
    
        }).catch((err) => {
            console.log(err);
        })
    },
    checkAuth:(req, res, next)=>{
        if (req.session.logedIn) {
            next()
        } else {
            if (req.path == '/signup') {
                res.render('user/signUp', { message: "" });
            }
            res.render('user/login', { message: "" });
        }
    },

    profile: (req,res)=>{
        userHelper.userAddress(req.session.user._id).then((address)=>{
            console.log(address);
            
            res.render('user/userinfo',{address:address,user:req.session.user})
        }).catch((err)=>{
            console.log(err);
            res.redirect('/');
        })
    },

    editUser: (req,res)=>{
        userHelper.editUser(req.body,req.session.user._id).then((response)=>{
            console.log(response);
            req.session.user = response;
            
            res.redirect('/profile');
        }).catch((err)=>{
            console.log(err);
            res.redirect('/edit-user');
            
        })
    },

    addAddress: (req,res)=>{
        const { body } = req;
        const userId = req.session.user._id;
    
        userHelper.addAddress(body, userId)
        .then(()=>{
            res.redirect('/profile');
        }).catch((err)=>{
            console.log(err);
            res.redirect('/add-address');
        })
    },
    getOneAddress: (req,res)=>{
        userHelper.getOneAddress(req.query.addressId).then((address)=>{
            console.log(address) ;
        res.render('user/editAddress',{address:address});
        }).catch((err)=>{
            console.log(err);
            res.redirect('/profile');
        })
    },
    editAddress: (req,res)=>{
        userHelper.editAddress(req.body).then(()=>{
            res.redirect("/profile");
        }).catch((err)=>{
            console.log(err);
            res.redirect('/edit-address');
        })
    },
    deleteAddress: (req,res)=>{
        userHelper.deleteAddress(req.query.addressId).then(()=>{
            res.redirect('/profile');
        })
    },
    forgetPassword: async(req,res)=>{
        const { email } = req.body;
        const user = await userHelper.getUser(email);
        if(!user){
            console.log("This email not registard");
        }
        const token = crypto.randomBytes(32).toString('hex');
        const expiration = Date.now() + 3600000; 
        await userHelper.addPasswordResets(email,token,expiration);
        const resetLink = `http://localhost:3000/reset-password?token=${token}`;
         userHelper.sendResetEmail(email, resetLink);
         res.redirect('/');
    },
    getResetPassword: async(req,res)=>{
        const { token } = req.query;
        const resetRequest = await userHelper.getPasswordResets(token);
        if (!resetRequest || resetRequest.expiration < Date.now()) {
           console.log('Token expired or invalid');
        }else{
            res.render('user/resetPassword',{token:token});
        }
    
    },
    postResetPassword: async (req, res) => {
        const { newPassword, token } = req.body;
        const resetRequest = await userHelper.getPasswordResets(token);
        
        if (!resetRequest || resetRequest.expiration < Date.now()) {
            console.log('Token expired or invalid');  
        }
        const email = resetRequest.email;
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userHelper.updatePassword(email,hashedPassword,token);
        console.log('Password has been reset successfully');
        res.render('user/success');
    },
    changePassword: (req, res) => {
        const { currentPassword, newPassword } = req.body;
        userHelper.changePassword(currentPassword, newPassword, req.session.user._id)
            .then((response) => {
                res.status(200).json({ message: response, success: true });
            })
            .catch((error) => {
                res.status(500).json({ message: error.message, success: false });
            });
    },

}