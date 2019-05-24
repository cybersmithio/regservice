var User = require('../models/userschema.js'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.serializeUser(function(user,done){
    done(null, user._id);
});

passport.deserializeUser(function(id,done){
    User.findById(id, function(err,user) {
        if( err || !user) return done(err,null);
        done(null,user);
    });
});



module.exports = function(app, options) {
    // if success and failure redirects aren't specified
    // set some reasonable defaults
    if( !options.successRedirect)
        options.successRedirect='/';
    if( !options.failureRedirect)
        options.failureRedirect='/login';
    return {
        init: function() {
            var env = app.get('env');
            var config=options.providers;

			passport.use(new GoogleStrategy({
				clientID: config.google[env].clientID,
				clientSecret: config.google[env].clientSecret,
				callbackURL: (options.baseUrl || '') + '/auth/google/callback',
			}, function(token, tokenSecret, profile, done){
				var authId = 'google:' + profile.id;
				console.log("Creating new user entry for Google",profile)
				User.findOne({ username: profile.id, domain: "google" }, function(err, user){
					if(err) return done(err, null);
					if(user) return done(null, user);
					user = new User({
						domain: "google",
						username: profile.id,
						name: profile.displayName,
						created: Date.now(),
						role: 'none',
					});
					user.save(function(err){
						if(err) return done(err, null);
						done(null, user);
					});
				});
			}));

            passport.use(new LocalStrategy(
                function(username, password, done) {
                    console.log("Looking up username:",username)

                    User.findOne({ domain: "local", username: username }, function(err, user) {
                        console.log("Looking for username:",username)
                        if (err) { return done(err); }
                        if (!user) {
                            console.log("Incorrect username")
                            return done(null, false, { message: 'Incorrect credentials.' });
                        }
                        /* TODO: get password hash working */
                        if (user.password != password) {
                            console.log("Incorrect password")
                            return done(null, false, { message: 'Incorrect credentials.' });
                        }
                        return done(null, user);
                    });
                }
            ));


            app.use(passport.initialize());
            app.use(passport.session());
        },

        registerRoutes: function() {
            app.get('/auth/google', function(req,res,next){
                if(req.query.redirect) req.session.authRedirect=req.query.redirect;
                passport.authenticate('google',{ scope: 'profile'})(req,res,next);
            });

            app.get('/auth/google/callback',passport.authenticate('google', {failureRedirect: options.failureRedirect }),function(req,res){
                //we only get here on successful authentication
                var redirect=req.session.authRedirect;
                if(redirect) delete req.session.authRedirect;
                res.redirect(303,req.query.redirect || options.successRedirect );
            });

            app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }),
                function(req, res) {
                    console.log("Redirecting due to login failure?")
                    res.redirect('/');
                }
            );
        }
    };

};



