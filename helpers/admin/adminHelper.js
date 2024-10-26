const { ObjectId, serialize } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');
const bcrypt = require('bcrypt');

module.exports = {
    doLogin: (adminDetails)=>{
        return new Promise(async(resolve,reject)=>{
            let response = {};
          try {
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({email:adminDetails.email});
            if(admin){ 
            // isMatch = await bcrypt.compare(adminDetails.password,admin.password);
           let isMatch = true;
           if(isMatch){
            response.admin = admin;
            response.status = true;
            resolve(response);
           }else{
            throw new Error('invalid password');
           }
            }else{
               throw new Error('admin not found');
            }
          } catch (error) {
            console.log(error);
            
            reject(error);
          }
        })
     },
     addBook: (bookDetails)=>{
        return new Promise(async (resolve,reject)=>{
            try {
           let response = await db.get().collection(collections.BOOK_COLLECTION).insertOne({bookDetails});
           resolve(response)
            } catch (error) {
                reject(error)
            }
        })
     }
    }
 