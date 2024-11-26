const userManagementHelper = require('../../helpers/admin/userManagementHelper');

module.exports = {
    getUsers: (req,res)=>{
        userManagementHelper.getusers().then((users)=>{
            console.log(users);
            
            res.render('admin/userManagement',{users:users});
        }).catch((err)=>{
            console.log(err);
        })
    },
    changeStatus:(req,res)=>{
        userManagementHelper.changeStatus(req.query.userId).then((response)=>{
            console.log(response);
            
            res.redirect('/admin/user-management')
        })
    }
}