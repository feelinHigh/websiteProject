var express = require("express");
var router = express.Router({mergeParams: true});
var Hotel = require("../models/hotel");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
	Hotel.findById(req.params.id, function(err, hotel){
		if(err){
			console.log(err);
		} else{
			res.render("comments/new", {hotel: hotel});
		}
	});
});

// Comments Create
router.post("/", middleware.isLoggedIn,  function(req, res){
	//lookup hotels using ID
	Hotel.findById(req.params.id, function(err, hotel){
		if(err){
			console.log(err);
			res.redirect("/hotels");
		} else{
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					req.flash("error", "Something went wrong");
					console.log(err);
				} else{
					//add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//save comment
					comment.save();
					hotel.comments.push(comment);
					hotel.save();
					req.flash("success", "Successfully added comment");
					res.redirect("/hotels/" + hotel._id);
				}
			});
		}
	});
});

//COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err){
			res.redirect("back");
		} else {
				res.render("comments/edit", {hotel_id: req.params.id, comment: foundComment});
		}
	});
});

//COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			res.redirect("back");
		} else {
			res.redirect("/hotels/" + req.params.id);
		}
	});
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect("back");
		} else {
			req.flash("success", "Comment deleted");
			res.redirect("/hotels/" + req.params.id);
		}
	});
});

module.exports = router;