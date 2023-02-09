var express = require("express");
var router = express.Router();
var Hotel = require("../models/hotel");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//INDEX - Show All Hotels
router.get("/", function(req, res){
	//Get all hotels from DB
	Hotel.find({}, function(err, allHotels){
		if(err){
			console.log(err);
		} else{
			res.render("hotels/index", {hotels: allHotels, page: 'hotels'});
		}
	});
});

//CREATE - Add New Hotel to DB
router.post("/", middleware.isLoggedIn, function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var price = req.body.price;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newHotel = {name: name, image: image, price: price, description: desc, author: author};
	//Create a new hotel and save to DB
	Hotel.create(newHotel, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else{
			//Redirect to hotels page
			res.redirect("/hotels");
		}
	});
});

//NEW - Show Form To Create New Hotel
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("hotels/new");
});

//SHOW - Shows More Info About One Hotel
router.get("/:id", function(req, res){
    //find the hotel with provided ID
    Hotel.findById(req.params.id).populate("comments").exec(function(err, foundHotel){
        if(err){
            console.log(err);
        } else {
            //render show template with that hotel
            res.render("hotels/show", {hotel: foundHotel});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkHotelOwnership, function(req, res){
   Hotel.findById(req.params.id, function(err, foundHotel){
		res.render("hotels/edit", {hotel: foundHotel});
	});
});


//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkHotelOwnership, function(req, res){
	Hotel.findByIdAndUpdate(req.params.id, req.body.hotel, function(err, updatedHotel){
		if(err){
			res.redirect("/hotels");
		} else {
			res.redirect("/hotels/" + req.params.id);
		}
	});
});

//DESTROY CAMPGROUND
router.delete("/:id", middleware.checkHotelOwnership, (req, res) => {
    Hotel.findByIdAndRemove(req.params.id, (err, hotelRemoved) => {
        if (err) {
            console.log(err);
        }
        Comment.deleteMany( {_id: { $in: hotelRemoved.comments } }, (err) => {
            if (err) {
                console.log(err);
            }
            res.redirect("/hotels");
        });
    });
});

module.exports = router;