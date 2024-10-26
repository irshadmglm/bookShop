const express = require('express');
const userManagementHelper = require('../../helpers/admin/userManagementHelper');
const router = express.Router();

router.get('/',(req,res)=>{
    userManagementHelper.getusers().then((users)=>{
        console.log(users);
        
        res.render('admin/userManagement',{users:users});
    }).catch((err)=>{
        console.log(err);
    })
})

router.get('/user-status',(req,res)=>{
    userManagementHelper.changeStatus(req.query.userId).then((response)=>{
        console.log(response);
        
        res.redirect('/user-management')
    })
})

module.exports = router;