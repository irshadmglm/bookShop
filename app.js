const express = require('express');
const app = express();
const session = require('express-session');
const db = require('./config/connection');
const passport = require('passport');
app.use(express.json());
require('dotenv').config();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret: "pGf3@4*Fz9q%LdWx8kN6$1Bv!A7yZtP", 
    resave: false, 
    saveUninitialized: false, 
    cookie: { maxAge: 1800000 } 
  }));
  app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const userRouter = require("./routes/user/userRoutes");
const outhRouter = require("./routes/user/authRouter")
const adminRouter = require("./routes/admin/adminRoutes");
const bookRouter = require('./routes/admin/bookRoutes');
const userManagement = require('./routes/admin/userManagementRoutes');
const userBooksRoutes = require('./routes/user/userBooksRoutes')
const userCart = require('./routes/user/cartRouter');
const order = require('./routes/user/orderRouter');
const orderManagement = require('./routes/admin/orderManagement');
const paymentRoutes = require('./routes/user/paymentRoutes');
const couponRouter = require('./routes/user/cuponRouter');
const couponMngRouter = require('./routes/admin/couponMngRouter');
const wishList = require('./routes/user/wishListRouter');
const OfferMngRouter = require('./routes/admin/offerMngRouter');
const walletRouter = require('./routes/user/walletRouter');
const adminDashboard = require('./routes/admin/salesReportRouter');
const middlewares = require('./middlewares/middlewares')

app.use('/user' , middlewares.cartCount);
app.use('/auth' , middlewares.cartCount);


app.set("view engine", "ejs");
process.env.NODE_OPTIONS = '--tls-min-v1.2';

db.connect((err) => {
    if (err) console.log("connection error" + err);
    else console.log("database connected to port 27017");
  });
//user
app.use('/auth', outhRouter)
 app.use('/user', userRouter);
 app.use('/user/userbooks',userBooksRoutes);
 app.use('/user/user-cart', userCart);
 app.use('/user/order',order);
 app.use('/user/payments', paymentRoutes);
 app.use('/user/coupons',couponRouter);
 app.use('/user/wish-list', wishList);
 app.use('/user/wallet',walletRouter);

//admin
 app.use('/admin', adminRouter);
 app.use('/admin/books', bookRouter);
 app.use('/admin/user-management',userManagement);
 app.use('/admin/order-management',orderManagement);
 app.use('/admin/coupon-management',couponMngRouter);
 app.use('/admin/offer-management',OfferMngRouter)
 app.use('/admin/admin-dashboard',adminDashboard)

app.listen(port,()=> console.log(`server is running on port ${port}`));