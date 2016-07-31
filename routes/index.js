var express = require('express');
var router = express.Router();
var users = require('../abc/info');
var bcrypt = require('bcrypt');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;

var salt = bcrypt.genSaltSync(10);

router.get('/', function(req, res, next) {
  var logout;
  if (req.cookies.user){
    logout = true;
  }
  else { logout = false; }
  res.render('index', {logout: logout});
});

router.get('/logout', function(req, res, next) {
  res.clearCookie("user");
  res.clearCookie("session");
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});
/* GET home page. */
router.get('/signin', function(req, res, next) {
  if (req.cookies.user){
    res.redirect(`/${req.cookies.session}/profile`)
    //or '/'
  }
  else {
    res.render('signin', { title: 'Login Test', message: ''});
  }
});

router.get('/signup', function(req, res, next) {
  if (req.cookies.user){
    res.redirect(`/${req.cookies.session}/profile`);
    //or '/'
  }
  else {
    res.render('signup', { title: 'Login Test', message: ''});
  }
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'email' ] }));

router.get('/auth/facebook/callback',
passport.authenticate('facebook', { failureRedirect: '/'}), function (req, res) {
  var profile = req.session.passport.user;
  users.FBUserProfile(profile.id).then(function(result){
    //console.log(result)
    //glitch alert: the same profile.id gets added to the database in some cases
    if (result.rows.length === 0){
      users.createFBUser(profile.id).then(function(){
        users.findFBid(profile.id).then(function(id){
          users.createLocalUserFB(profile.displayName, profile.emails[0].value, id.rows[0].id).then(function(){
            users.FBUserProfile(profile.id).then(function(thisprofile){
                var trueid = thisprofile.rows[0].id;
                var id = bcrypt.hashSync(String(trueid), salt);
                res.cookie("user", id);
                res.cookie("session", trueid);
                res.redirect(`/${trueid}/profile`);
            });
          });
        });
      });
    }
    else {
      users.FBUserProfile(profile.id).then(function(theresult){
        var trueid = theresult.rows[0].id;
        var id = bcrypt.hashSync(String(trueid), salt);
        res.cookie("user", id);
        res.cookie("session", trueid);
        res.redirect(`/${trueid}/profile`);
      });
    }
  });
});

router.get('/:id/profile', function(req, res, next) {
  var logout;
  if (req.cookies.user){
    logout = true;
  }
  else { logout = false; }
  users.localUserProfile(req.params.id).then(function(user_data){
    res.render('profile', { title: 'Login Test', user: user_data.rows[0], logout: logout});
  });
});

router.post('/signin', function(req, res, next) {
  if (!req.body.email || !req.body.password){
    res.render('signin', {title: 'Login Test', message: 'fields cannot be blank'});
  }
  else {
    var thispassword = req.body.password;
    users.findIdbyEmail(req.body.email).then(function(result){
      if (result.rows.length !== 0){
        users.localUserProfile(result.rows[0].id).then(function(user_data){
        if (user_data.rows[0].password !== null){
          if (bcrypt.compareSync(thispassword, user_data.rows[0].password)){
            var trueid = result.rows[0].id;
            var id = bcrypt.hashSync(String(trueid), salt);
            res.cookie("user", id);
            res.cookie("session", trueid);
            res.redirect(`/${trueid}/profile`);
          }
          else { res.render('signin', {title: 'Login Test', message: 'invalid email/password combination'}); }
        }
        else { res.render('signin', {title: 'Login Test', message: 'please login with Facebook'});  } //in case user tries to login with same email as facebook account
        });
      }
      else { res.render('signin', {title: 'Login Test', message: 'invalid email/password combination'}); }
    });
  }
});

router.post('/signup', function(req, res, next) {
  if (!req.body.email || !req.body.name || !req.body.password){
    res.render('signup', {title: 'Login Test', message: 'fields cannot be blank'});
  }
  users.findIdbyEmail(req.body.email).then(function(result){
    if (result.rows[0]){
      res.render('signin', {title: 'Login Test', message: 'you are already a user, please log in'});
    }
    else {
      req.body.password = bcrypt.hashSync(req.body.password, salt);
      users.createLocalUser(req.body).then(function(){
        users.findIdbyEmail(req.body.email).then(function(user_id){
          var trueid = user_id.rows[0].id;
          var id = bcrypt.hashSync(String(trueid), salt);
          res.cookie("user", id);
          res.cookie("session", trueid);
          res.redirect(`/${trueid}/profile`);
        });
      });
    }
  });
});

module.exports = router;
