/*jshint esversion: 6 */
var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require('connect-flash'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    methodOverride = require('method-override'),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds"),
    port = process.env.PORT || 5000;

var commentRoutes = require('./routes/comments'),
    campgroundRoutes = require('./routes/campgrounds'),
    indexRoutes = require('./routes/index');

mongoose.connect("mongodb+srv://nikunj:nikunj123@yelpcamp-3hfzr.gcp.mongodb.net/yelp_camp?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to Databse'))
.catch(err => console.log('Could not connect to MongoDB: ', err));
mongoose.set('useFindAndModify', false);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");

app.use(flash());

app.use(require('express-session')({
    secret: "This is a secret...",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});


app.use('/', indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

app.listen(port, function () {
    console.log("Server has started at port: " + port);
});