const express = require('express');
const app = express();
const path = require("path");

require('./db');
const mongoose = require('mongoose');
const Team = mongoose.model('Team');
const Player = mongoose.model('Player');

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const publicPath = path.resolve(__dirname, "public");
const PORT = 17884;

app.set('view engine', 'hbs');


app.use(express.urlencoded( { extended: false }));
app.use(express.static(publicPath)); 

app.use(function(req, res, next) {
	console.log("Method: " + req.method + "\n");
	console.log("Path: " + req.path + "\n");
	console.log("Query: ");
	console.log(req.query);
	console.log("\n");
	next();
});

 
// home page needs a lot of work still
app.get('/', function(req, res) {
	res.render('home-page');
});

app.post('/', function(req, res) {

	console.log(req.body);
	res.redirect('/');
});

app.get("/team/create", function(req, res) {
	res.render('team-create');
});

app.post('/team/create', function(req, res) {
	console.log(req.body);
	new Team({
		location: req.body.location,
		mascot: req.body.mascot,
  		color1: req.body.color1,
  		color2: req.body.color2,
  		coach: req.body.coach
	}).save(function(err, team, count) {
		if (err) {
			console.log("could not save new team");
			res.redirect('/');
		}
		else {
			console.log("saved a new Team!\n");
			res.redirect('/allteams');
		}
	
	});
});

app.get('/allteams', function(req,res) {
	Team.find(function(err, teams, count) {
		if(err) {
			console.log("could not find any teams");
			res.redirect("/");
		}
		else {
			console.log(teams);
			res.render('all-teams', {"teams": teams});
		}	
	});
});

app.get('/team', function(req, res) {
	Team.findOne({location: "Austin" }, function(err, team, count) {
		if(err) {
			console.log("could not find your team");
		}
		else {
			console.log(team);
			res.render('team-page', {"teamName": team.location});
		}
	});
	//res.render('team-page', {"teamName": "NY"});
});


app.listen(process.env.PORT || 3000);
console.log("Connected\n");