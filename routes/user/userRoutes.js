const express = require('express');
const userHelper = require('../../helpers/user/userHelper');
const passport = require('passport');
const bookHelper = require('../../helpers/admin/bookHelper');
const router = express.Router();
require('../../middlewares/auth')

function checkAuth(req, res, next) {
    if (req.session.logedIn) {
        next()
    } else {
        if (req.path == '/signup') {
            res.render('user/signUp', { message: "" });
        }
        res.render('user/login', { message: "" });
    }
}

router.get('/', checkAuth, (req, res) => {
    bookHelper.getbooks().then((response) => {
        const [books, categories] = response;
        const breadcrumbs = [{ name: 'Home', url: '/' }];
        res.render('user/userhome', { books: books, categories: categories, breadcrumbs: breadcrumbs })

    }).catch((err) => {
        console.log(err);
    })
})
router.get('/signup', (req, res) => {
    res.render('user/signUp', { message: '' })
})

router.post('/signup', async (req, res) => {
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

})

router.post('/verify-otp', (req, res) => {
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
});
router.get('/resend-otp', (req, res) => {
    let otp = Math.floor(1000 + Math.random() * 9000);
    req.session.otp = otp;
    userHelper.sendOtp(req.session.temp, otp).then(() => {
        res.render('user/otp', { message: "" });
    }).catch((error) => {
        console.log(error);

        res.render('user/signUp', { message: error.message });
    });
})

router.post('/login', (req, res) => {
    userHelper.doLogin(req.body).then((response) => {
        if (response.status) {
            req.session.user = response.user;
            req.session.logedIn = true;
        }
        res.redirect('/');
    }).catch((error) => {
        res.render('user/login', { message: error.message })
    })
})
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
}));

router.get('/demouser')

// Google Authentication Callback
router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/signup'
}),
    (req, res) => {
        if (req.user.isBlocked) {
            res.render('user/login', { message: "User is blocked" })
        } else {
            console.log('Authenticated user:', req.user);
            req.session.user = req.user;
            req.session.logedIn = true;
            res.redirect('/');
        }
    }
);




module.exports = router;

// OTP Verification Route
// router.post('/verify-otp', async (req, res) => {
//     const userOtp = req.body.otp;
//     const hashedOTP = req.session.otp;
//     const otpExpires = req.session.otpExpires;

//     // Check if OTP is expired
//     if (Date.now() > otpExpires) {
//         return res.status(400).json({ message: 'OTP has expired' });
//     }

//     // Compare the OTP (after hashing) with the stored hash
//     const isMatch = await bcrypt.compare(userOtp, hashedOTP);
//     if (isMatch) {
//         res.status(200).json({ message: 'OTP verified successfully' });
//     } else {
//         res.status(400).json({ message: 'Invalid OTP' });
//     }
// });