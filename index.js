/* dependencies */
    const http = require("http");
    const fs = require("fs");                               // file system
    const path = require("path");                           // access paths
    const express = require("express");                     // express
    const bodyParser = require('body-parser');              // parse request body
    const MongoClient = require('mongodb').MongoClient;     // talk to mongo

/* app setup */
    const app = express();                                  // create app
    app.set("port", process.env.PORT || 3000)               // we're gonna start a server on whatever the environment port is or on 3000
    app.set("views", path.join(__dirname, "/"));            // tells us where our views are
    app.set('view engine', 'ejs');

    const leaderboard = require("leaderboard");

    app.listen(app.get("port"), function() {
        console.log("Server started on port " + app.get("port"));
    });


    if(process.env.LIVE){                                                                           // this is how I do config, folks. put away your pitforks, we're all learning here.
        dbAddress = "mongodb://" + process.env.MLAB_USERNAME + ":" + process.env.MLAB_PASSWORD + "@ds135444.mlab.com:35444/bookvsmovie";
    } else {
        dbAddress = "mongodb://localhost:27017/spacesquares";
    }


MongoClient.connect(dbAddress, function(err, db){
    if (err){
        console.log("MAYDAY! MAYDAY! Crashing.");
        return console.log(err);
    }


/* middleware */
    app.use(function(req, res, next){
        console.log(req.method.toUpperCase() + " '" + req.url + "' on " + Date.now());  
        next();
    });

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(express.static(path.join(__dirname, 'public')));                           // sets the correct views for the CSS file/generally accessing files



/* routes */
    app.get("/", function(req, res){
        res.render("index");
    });

    app.get("/leaderboard", function(req, res){



    });

    app.post("/leaderboard", function(req, res){



    });



});