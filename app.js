require('dotenv').config({silent: true});
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var bcrypt = require('bcrypt');
var db = require('./abc/info');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
  //console.log('Express server listening on port ' + server.address().port);
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	  keys: [process.env.SESSION_KEY1, process.env.SESSION_KEY2],
	  secret: 'bam',
	  resave: false,
	  saveUninitialized: true
  }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.HOST + "/auth/facebook/callback",
        passReqToCallback: true,
				profileFields: [ 'displayName', 'email' ] // 100% needed to get email
    },
    function(req, accessToken, refreshToken, profile, done) {
        //console.log(profile.id, profile.displayName, accessToken);
				return done(null, profile);
    }));

    	passport.serializeUser(function(user, done) {
    	  done(null, user);
    	});

    	passport.deserializeUser(function(user, done) {

    	  //here is where you will go to the database and get the user by id,
    	  // after you set up your db
    	  done(null, user)
    	});

    	app.use(function (req, res, next) {
    	  res.locals.user = req.user
    	  next()
    	})

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
