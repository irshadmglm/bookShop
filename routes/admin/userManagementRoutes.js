const express = require('express');
const userMngController = require('../../controllers/admin/userMngController');
const router = express.Router();

router.get('/',userMngController.getUsers);

router.get('/user-status',userMngController.changeStatus)

module.exports = router;