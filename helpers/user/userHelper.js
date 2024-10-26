const { ObjectId, serialize } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { reject } = require('bcrypt/promises');




module.exports = {
  sendOtp: (data, otp) => {
    return new Promise(async (resolve, reject) => {
      try {
        let isEmail = await db.get().collection(collections.USER_COLLECTION).findOne({ email: data.email });
        if (isEmail) throw new Error('Email already registered');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'irshadmglm@gmail.com',
            pass: 'sxlo urjf soxg bgor'
          }
        });
        const mailOptions = {
          from: 'irshadmglm@gmail.com',
          to: data.email,
          subject: 'Your OTP for Verification',
          text: `Your OTP is ${otp}. It will expire in 2 minutes.`
        };
        // Send the OTP via email
        await transporter.sendMail(mailOptions);
        resolve('OTP sent to email successfully!')
      } catch (error) {
        reject(error)
      }
    })
  },
  signWithGoogle: () => {
    return new Promise((resolve, reject) => {
      // This function is now asynchronous and will resolve when needed
      passport.authenticate('google', function (err, user, info) {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  },
  doSignup: (userDetails) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      try {
        let saltRound = 10;
        userDetails.password = await bcrypt.hash(userDetails.password, saltRound);
        let data = await db.get().collection(collections.USER_COLLECTION).insertOne(userDetails);
        let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: new ObjectId(data.insertedId) });

        response.user = user;
        response.status = true;
        console.log(response);

        resolve(response);
      } catch (error) {
        reject(error);
      }
    })
  },
  doLogin: (userDetails) => {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userDetails.email, isBlocked: false });
        if (user) {
          isMatch = await bcrypt.compare(userDetails.password, user.password);
          if (isMatch) {
            await db.get().collection(collections.USER_COLLECTION).updateOne({ email: user.email }, { $set: { last_logedIn: new Date().toISOString() } })
            resolve({
              user: user,
              status: true
            });
          } else {
            throw new Error('invalid password');
          }
        } else {
          throw new Error('User not found');
        }
      } catch (error) {
        console.log(error);

        reject(error);
      }
    })
  },
  addAddress:(address, userId)=>{
    return new Promise(async(resolve,reject)=>{
      try {
        await db.get().collection(collections.ADDRESS_COLLECTION).insertOne({user_id:userId, address:address,added_at: new Date().toISOString()});
        resolve();
      } catch (error) {
        reject(error);
      }
    })
  },
  userAddress: (userId) => {
    return new Promise(async(resolve, reject) => {
      try {
       let address = await db.get().collection(collections.ADDRESS_COLLECTION).find({user_id: new ObjectId(userId)}).toArray();
       resolve()
      } catch (error) {
        reject(error)
      }
    })
  },
  getUser:(email)=>{
    return new Promise(async(resolve,reject)=>{
      try {
      const user = await db.get().collection(collections.USER_COLLECTION).findOne({email:email});
      resolve(user);
      } catch (error) {
       reject(error);
      }
    })
  },
  addPasswordResets:(email,token,expiration)=>{
    return new Promise((resolve,reject)=>{
      try {
        db.get().collection(collections.PASSWORD_RESETS_COLLECTION).insertOne({email,token,expiration})
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  },
  sendResetEmail:(to,link)=>{
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'irshadmglm@gmail.com',
            pass: 'sxlo urjf soxg bgor'
      }
  });

  const mailOptions = {
      from: 'irshadmglm@gmail.com',
      to: to,
      subject: 'Password Reset Request',
      html: `<p>Click the link below to reset your password:</p><a href="${link}">Reset Password</a>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email:', error);
      } else {
          console.log('Email sent:', info.response);
      }
  });
  },
  getPasswordResets:(token)=>{
    return new Promise(async(resolve,reject)=>{
      try {
       let resetRequest = await db.get().collection(collections.PASSWORD_RESETS_COLLECTION).findOne({token:token});
       resolve(resetRequest);
      } catch (error) {
        reject(error)
      }
    })
  },
  updatePassword:(email,password,token)=>{
    return new Promise(async(resolve,reject)=>{
   try {
    await db.get().collection(collections.USER_COLLECTION).updateOne({ email:email }, { $set: { password:password } });
    await db.get().collection(collections.PASSWORD_RESETS_COLLECTION).deleteOne({token:token})
    resolve()
   } catch (error) {
    reject(error);
   }
    })
  }
}