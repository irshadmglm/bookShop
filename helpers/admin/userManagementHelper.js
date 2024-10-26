const { ObjectId, serialize } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');
const bcrypt = require('bcrypt');
const { response } = require('express');

module.exports = {
    getusers:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
               let users = await db.get().collection(collections.USER_COLLECTION).find().toArray();
               resolve(users);
            } catch (error) {
                reject(error);
            }
        })
    },
    changeStatus:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                const user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: new ObjectId(userId) });
                const newBlockedStatus = !user.isBlocked;
               let response= await db.get().collection(collections.USER_COLLECTION).updateOne({ _id: new ObjectId(userId) },{ $set: { isBlocked: newBlockedStatus } });
                resolve(response);
            } catch (error) {
                reject(error);
            }
        })
    },
    
}