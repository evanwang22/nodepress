var express = require('express');
var router = express.Router();
var fs = require('fs');
var nodemailer = require("nodemailer");

router.get('/', function(req, res) {
  	var db = req.db
  	var collection = db.get('postcollection');
  	var connections = db.get('followers');
  	var users = [req.cookies.email]

  	connections.find({"follower": req.cookies.email}, function(err, docs) {
    	for (var i = 0; i < docs.length; i++) {
      		users.push(docs[i].user_email)
    	}
    	collection.find({"user_email": {$in : users}}, {"sort": [['_id', -1]]}, function(e, docs) {
      		res.render('blog', { 'posts': docs, 'user':req.cookies.email, 'message': "" });
    	});
  	})
});

router.get('/new_post', function(req, res) {
  	res.render('new_post');
});

router.post('/add_post', function(req, res) {
    console.log("add post called")

    var db = req.db

    var title = req.body.title
    var body = req.body.body
    var tmp_path, target_path, image;

    console.log(req.files);

    if (req.files.image){
        image = req.files.image.originalFilename;
        tmp_path = req.files.image.path;
        target_path = './public/images/' + image;

        // TODO: Clean this up -- maybe use a hash or something
        if (fs.exists(target_path, function(exists){
          	if(exists){
	            console.log("exists");
	            image = image.split('.')[0] + '1.' + image.split('.')[1];
	            target_path = './public/images/' + image;
          	}
        }));
        console.log(image, target_path);

        fs.rename(tmp_path, target_path, function(err){
          	console.log("rename", target_path, image);
          	if (err) throw err;
          	fs.unlink(tmp_path, function(){
            	if (err) throw err;
          	});
        });
    }

    var collection = db.get('postcollection');

    collection.insert({
        "title" : title,
        "body" : body,
        "user_email" : req.cookies.email,
        "image" : image,
        "dir_path" : "/images/" + image
    }, function (err, doc) {
        if (err) {
    	    res.render('error', {
                message: err.message,
                error: err
            });
        } else {
          	res.redirect("/blog");
        }
    });
});

router.post('/follow', function(req, res) {
    var follow = req.body.email
    var db = req.db
    var users = db.get('usercollection');
    var connections = db.get('followers');

    users.findOne({"email":follow}, function(err, user) {
        if (err) {
            res.render('error', {
                message: err.message,
                error: err
            });
        }
        if (user) {
            connections.insert({
                "user_email": follow,
                "follower": req.cookies.email
            }, function(err, doc) {
                if (err) {
                    res.render('error', {
                        message: err.message,
                        error: err
                    });
                } else {

                	mailOptions.to = follow
                	smtpTransport.sendMail(mailOptions, function(error, response) {
                		if (error) {
                			console.log(error)
                		} else {
                			console.log("Message sent: "+response.message);
                		}
                		smtpTransport.close();
                	});

                    res.redirect("/blog")
                }
            });
        } else {
            res.send("There's no user with that email");
        }
    });
});

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "nodepress33@gmail.com",
        pass: "33nodepress"
    }
});

var mailOptions = {
    from: "Node Press <foo@blurdybloop.com>", // sender address
    to: "", // list of receivers
    subject: "New follower on Node Press", // Subject line
    text: "Hi, you have a new follower!", // plaintext body
    html: "<b>Hi, you have a new follower!</b>" // html body
}


module.exports = router;