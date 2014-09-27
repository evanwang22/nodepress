var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var connect = require('connect-multiparty');
var nodemailer = require("nodemailer");
var fs = require('fs');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/nodepress');

// Create new application
var app = express();

// temporary directory for image uploading
process.env.TMPDIR = './tmp';

// view engine setup for EJS
// Serve views from /views but make it seem top level
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Logs every request
app.use(logger('dev'));

// Middleware which parses request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// Parse cookie header and populate req.cookies
app.use(cookieParser());

// Serve static objects from /public but make it seem top level
app.use(express.static(path.join(__dirname, 'public')));

// All views rendered via layout.ejs as "body"
app.use(partials());

// Used for image uploading, creates temp files on your server
// Should find a better module for this
app.use(connect());

// Middleware which populates req.db with our monk connection
app.use(function(req,res,next){
    req.db = db;
    next();
});

var index = require('./routes/index');
var blog = require('./routes/blog');

console.log(typeof db.get('postcollection'));

// Use module routes/index, a router() instance
app.use('/', index);
// Use module routes/blog, a router() instance
app.use('/blog', blog);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

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

// All modules export an object which can be called
// elsewhere in the code. Here, we export the app
// object
module.exports = app;
