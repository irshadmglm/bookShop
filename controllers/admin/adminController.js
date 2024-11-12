const adminHelper = require('../../helpers/admin/adminHelper'); 
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/images/uploads')); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
 
  const upload = multer({ storage: storage }); 

module.exports = {
    login: (req,res)=>{
        adminHelper.doLogin(req.body).then((response)=>{
            if(response.status){ 
                req.session.admin = response.admin;
                req.session.logedIn = true;
            }
            res.redirect('/books');
        }).catch((error)=>{
            res.render('admin/login',{message:error.message});
        })
    },

    logOut: (req,res)=>{
        req.session.destroy();
        res.redirect('/admin');
    },
    addBook: (req, res, next) => {
        upload.array('images', 3)(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                // Handle multer-specific errors
                console.error('Multer error:', err);
                return res.status(400).send({ message: 'File upload error: ' + err.message });
            } else if (err) {
                // Handle other types of errors
                console.error('Error:', err);
                return res.status(500).send({ message: 'File upload error: ' + err.message });
            }
    
       
            console.log(req.body); // Form data
            console.log(req.files); // Uploaded files 
    
            adminHelper.addBook(req.body).then((response) => {
                console.log(response);
                res.redirect('/admin');
            }).catch((error) => {
                console.log(error);
                res.redirect('/admin/add-book');
            });
        });
    },
    checkAuth: function checkAuth(req,res,next){
        if(req.session.logedIn){
            next()
        }else{
            res.render('admin/login',{message:''});
        }
    },

}