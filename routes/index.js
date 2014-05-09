var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');

/* GET home page */
router.get('/', function(req, res) {
    res.render('index', {message:""});
});

/* GET signup page */
router.get('/signup', function(req, res) {
    res.render('signup', {message:""});
});

/* POST to signups and create new user */
router.post('/signup', function(req, res) {
    var db = req.db
    var email = req.body.email
    var password = genHash(req.body.password)

    var users = db.get('usercollection');

    users.findOne({ "email": email }, function(err, user) {

        if (err) {
            res.render('error', {
                message: err.message,
                error: err
            });
        }

        // Following user already exists
        if (user) {
            res.render("signup", {
                message: "Email already taken"
            });
        } else {
            users.insert({
                "email":email,
                "password":password
            }, function(err, doc) {
                if (err) {
                    res.render('error', {
                        message: err.message,
                        error: err
                    });
                } else {
                    res.cookie('login_token', +new Date(), { maxAge: 3600000, httpOnly: true });
                    res.cookie('email', email);
                    res.redirect("/blog")
                }
            });
        }
    });
});

/* GET login page */
router.get('/login', function(req, res) {
    res.render('login', {message:""});
});

/* POST to start session */
router.post('/login', function(req, res) {
    var db = req.db
    var email = req.body.email
    var password = req.body.password

    var users = db.get('usercollection')

    users.findOne({ "email": email}, function(err, user) {
        if (err) {
            res.render('error', {
                message: err.message,
                error: err
            });
        }

        if (!user) {
            res.render("login", {
                message: "Email not recognized."
            });
        } else if (bcrypt.compareSync(password, user.password) == false) {
            res.render("login", {
                message: "Wrong password!"
            });
        } else {
            res.cookie('login_token', +new Date(), { maxAge: 3600000, httpOnly: true });
            res.cookie('email', email);
            res.redirect("/blog");
        }
    });
});

/* GET logout */
router.get('/logout', function(req, res) {
    if (req.cookies.email) {
        res.clearCookie('login_token');
        res.render('index', {message:"Successfully logged out"});
    } else {
        res.render('index', {
            message: "You aren't logged in!"
        });
    }
});

function genHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

module.exports = router;
