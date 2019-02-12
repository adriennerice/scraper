// Packages
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var cheerio = require("cheerio");
var axios = require("axios");

// Models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure Middleware
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/animeNews", { useNewUrlParser: true });

// Check if connected to db
var dbConnect = mongoose.connection;
dbConnect.on('error', console.error.bind(console, 'connection error:'));
dbConnect.once('open', function() {
    console.log("DB connected")
});


// Routes
app.get("/", function(req, res){
   console.log("handebars index")
    res.render("index"); 
});

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
        res.send("Scrape Complete");
});

// Route for getting all News Articles from the db
app.get("/articles", function(req, res) {
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

// Start server
app.listen(PORT, function(){
    console.log("App is running on port " + PORT);
})