const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

// Simple placeholder function since we don't have a User model yet
const findUserById = (id) => {
  return Promise.resolve({
    id,
    email: 'user@example.com',
    name: 'Test User'
  });
};

module.exports = (passport) => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret_here'
  };

  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        // In a real app, this would look up the user in the database
        const user = await findUserById(payload.id);
        
        if (user) {
          return done(null, user);
        }
        
        return done(null, false);
      } catch (error) {
        console.error('Error in JWT strategy:', error);
        return done(error, false);
      }
    })
  );
};