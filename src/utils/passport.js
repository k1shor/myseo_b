import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";

export function configurePassport(app) {
  app.use(passport.initialize());

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
    console.warn("⚠️ Google OAuth env vars missing; /api/auth/google will be disabled.");
    return;
  }

  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile?.emails?.[0]?.value?.toLowerCase();
      if (!email) return done(new Error("Google account missing email"));

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: profile.displayName || "Google User",
          email,
          provider: "google",
          providerId: profile.id,
          avatarUrl: profile?.photos?.[0]?.value
        });
      } else {
        // attach provider if missing
        if (user.provider !== "google") {
          user.provider = "google";
          user.providerId = profile.id;
          user.avatarUrl = user.avatarUrl || profile?.photos?.[0]?.value;
          await user.save();
        }
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
}
