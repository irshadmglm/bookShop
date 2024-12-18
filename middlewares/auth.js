require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../config/connection');
const collections = require('../config/collection');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true,
    scope: ['profile', 'email'],
    prompt: 'select_account'
  },
  async function(request, accessToken, refreshToken, profile, done) { 
    try {
      console.log("Google Profile:", profile); 
      
      if (!profile || !profile.id) {
        return done(new Error("Invalid Google profile data")); 
      }

      
       await db.get().collection(collections.USER_COLLECTION).updateOne({ googleId: profile.id },{$set:{last_logedIn: new Date().toISOString()} });
      let user = await db.get().collection(collections.USER_COLLECTION).findOne({ googleId: profile.id });
      
      if (user) {
        console.log("Existing user found:", user);
        return done(null, user);
      } else {
        // Create a new user
        let newUser = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          password: await bcrypt.hash(profile.id, 10),  
          joined_date: new Date().toISOString(),
          last_logedIn: new Date().toISOString()
        };

        let data = await db.get().collection(collections.USER_COLLECTION).insertOne(newUser);
        let createdUser = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: new ObjectId(data.insertedId) });

        console.log("New user created:", createdUser);
        return done(null, createdUser);  // Return the newly created user
      }
    } catch (error) {
      console.error("Error during Google authentication:", error);
      return done(error);  // Handle errors and pass to the callback  
    }
  }
));

// Serialize the user
passport.serializeUser(function(user, done) {
  done(null, user._id);  // Only store the user ID in the session
});

// Deserialize the user
passport.deserializeUser(async function(id, done) {
  try {
    let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: new ObjectId(id) });
    
    if (!user) {
      console.error("User not found during deserialization");
      return done(new Error("User not found"));
    }
    
    done(null, user);  // User found, pass user data
  } catch (error) {
    console.error("Error during deserialization:", error);
    done(error);  // Pass any errors during deserialization
  }
});

module.exports = passport;
