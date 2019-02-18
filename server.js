// Packages
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var cheerio = require("cheerio");
var axios = require("axios");

// Models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure Middleware
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Designate the public folder as a static directory
app.use(express.static("public"));

// Connect Handlebars to Express app
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to mongo database
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/animeNews";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });


// mongoose.connect("mongodb://localhost/animeNews", { useNewUrlParser: true });

// Check if connected to db
var dbConnect = mongoose.connection;
dbConnect.on('error', console.error.bind(console, 'connection error:'));
dbConnect.once('open', function() {
    console.log("DB connected")
});


// Routes

     // Route for getting all News Articles from the db to homepage
     app.get("/", function(req, res) {
        // Grab every document in the Articles collection
        db.Article.find({})
        .then(function(dbArticle) {
            var hbsObject = {
                news: dbArticle
            };
            // If we were able to successfully find Articles, send them back to the client
            res.render("index", hbsObject);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
    });
    
    // This route renders the saved handlebars page
    app.get("/saved", function(req, res) {
        db.Article.find({saved: true})
        .then(function(articles){
            let hbsObject;

            hbsObject = {
                news: articles
            };

            res.render("saved", hbsObject); 
        })
        .catch(function (err) {
            res.json(err);
        })
        
    });
 
    // Route to scrape news
    app.get("/scrape", function(req,res) {
        axios.get("https://www.crunchyroll.com/").then(function(response) {
            
            var $ = cheerio.load(response.data);
    
            $("a.welcome-crnews-title").each(function(i, element) {
                var result = {};
    
                // scrape news properties
                result.headline = $(this).text();
                result.summary = $(this).siblings().children("p").text();
                result.url = $(this).attr("href");
                result.imgUrl = $(this).parent().siblings().children("img").attr("src");
                
                console.log(result);

                // Create new Article
                db.Article.create(result)
                    .then(function(dbArticle) {
                        console.log(dbArticle);
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            })
        });
        console.log("Scrape Complete");    
        res.redirect("/");
    });
    
    // Route to save an article 
    app.put("/save/:id", function(req, res) {
        // Grab every document in the Articles collection
        db.Article.findOneAndUpdate({_id: req.params.id},{saved: true})
            .then(function(article){
                res.json(article);
            })
            .catch(function(err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route to delete/remove Article from saved page
    app.put("/delete/:id", function(req, res) {
        db.Article.findOneAndUpdate({_id: req.params.id},{saved: false})
        .then(function(article){
            res.json(article); 
        })
        .catch(function (err) {
            res.json(err);
        })
    });

   

    // Route to save note
    app.post("/note/:id", function(req, res) {
        console.log(req.body)
        db.Note.create(req.body)
            .then(function(note){
                return db.Article.findOneAndUpdate({_id: req.params.id}, {$push: {notes: note._id}}, {new: true});
            })
            .then(function(article){
                res.json(article); 
            })
            .catch(function (err) {
                res.json(err);
            })
        });

    // Get all notes for save article
    app.get('/getNotes/:id', function(req, res){
        db.Article.findOne({_id: req.params.id})
        .populate({path: 'notes', model: 'Note'})
        .then(function(results){
            res.json(results);
        })
        .catch(function (err) {
            res.json(err);
        })
    })
 // Route to get Article by id and populate it with Notes
//  app.get("/article/:id", function(req, res){
//     db.Article.findOne({_id: req.params.id})
//         .populate('notes')
//         .then(function(article){
//             res.json(article)
//         })
//         .catch(function(err){
//             res.json(err);
//         })
// })

// Delete Note
app.delete("/note/:id", function(req, res){
    db.Note.findByIdAndRemove({_id: req.params.id})
    .then(function(note){
        return db.Article.findOneAndUpdate({note: req.params.id}, {$pullAll: [{note: req.params.id}]});
    })
    .then(function(article){
        res.json(article);
    })
    .catch(function(err){
        res.json(err);
    });
});

// Listen on the port

app.listen(PORT, function() {
    console.log("Listening on port: " + PORT);
});