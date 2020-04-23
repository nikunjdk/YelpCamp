var express = require("express");
var router = express.Router({ mergeParams: true });
var Campground = require("../models/campground");
var Comment = require('../models/comment');
var middleware = require('../middleware');

router.get("/", function (req, res) {
    Campground.find({}, function (err, allcampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allcampgrounds });
        }
    });
});

router.post("/", middleware.isLoggedIn, function (req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = { name: name, image: image, description: description, author: author };
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            console.log(newlyCreated);            
            res.redirect("/campgrounds");
        }
    });
});

router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

router.get("/:id", function (req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

router.get('/:id/edit', middleware.checkedCampgroundOwnership, function(req, res) {
    if(req.isAuthenticated()) {
        Campground.findById(req.params.id, function(err, foundCampground) {
            if(err) {
                res.redirect("/campgrounds");
            } else {
                if(foundCampground.author.id.equals(req.user._id)) {
                    res.render("campgrounds/edit", {campground: foundCampground});
                } else {

                }
            }
        });
    } else {
        res.redirect('/login');
    }    
});

router.put('/:id', middleware.checkedCampgroundOwnership,function(req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
        if(err) {
            res.redirect('/campgrounds');
        } else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

router.delete('/:id', middleware.checkedCampgroundOwnership,function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err, campgroundRemoved) {
        if(err) {
            res.redirect('/campgrounds');
        } else {
            Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, function(err) {
                if (err) {
                    console.log(err);
                }
                res.redirect("/campgrounds");
            });
        }
    });
});

module.exports = router;