import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import Account from "../models/account.model.js";
import dotenv from "dotenv";
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const image = profile.photos[0].value;
      const providerAccountId = profile.id;

      try {
        let user = await User.findOne({ email });

        // Create user if doesn't exist
        if (!user) {
          user = await User.create({
            name,
            email,
            photo: image,
          });
        }

        // Check for existing account
        let account = await Account.findOne({
          provider: "google",
          providerAccountId,
        });

        if (!account) {
          account = await Account.create({
            userId: user._id,
            name,
            image,
            provider: "google",
            providerAccountId,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
