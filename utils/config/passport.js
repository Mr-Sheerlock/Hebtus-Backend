const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../../models/userModel');

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/login/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          GoogleID: profile.id,
          name: {
            firstName: profile.displayName.split(' ')[0],
            lastName: profile.displayName.split(' ')[1],
          },
          img_url: profile.photos[0].value,
          password: Math.random().toString().substr(2, 10),
          email: profile.emails[0].value,
        };
        try {
          let user = await User.findOne({ GoogleID: profile.id });
          if (user) {
            done(null, user);
          } else {
            user = await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
