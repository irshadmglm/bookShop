const express = require('express');
const app = express();
const session = require('express-session');
const db = require('./config/connection');
const passport = require('passport');

require('dotenv').config();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret: process.env.SESSION_SECRET, 
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
const adminRouter = require("./routes/admin/adminRoutes");
const bookRouter = require('./routes/admin/bookRoutes');
const userManagement = require('./routes/admin/userManagementRoutes');
const userViewBook = require('./routes/user/userBooksRoutes')
const userCart = require('./routes/user/cartRouter');


app.set("view engine", "ejs");

db.connect((err) => {
    if (err) console.log("connection error" + err);
    else console.log("database connected to port 27017");
  });

 app.use('/', userRouter);
 app.use('/admin', adminRouter);
 app.use('/books', bookRouter);
 app.use('/user-management',userManagement);
 app.use('/userbook',userViewBook);
 app.use('/user-cart', userCart);

app.listen(port,()=> console.log(`server is running on port ${port}`));