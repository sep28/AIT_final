const express = require('express');
const app = express();
const path = require("path");

require('./db');
require('./auth');
const mongoose = require('mongoose');
const Team = mongoose.model('Team');
const Player = mongoose.model('Player');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = mongoose.model('User');

//add session support
const session = require('express-session');
const sessionOptions = {
	secret: 'some random things that you dont need to know',
	resave: true,
	saveUninitialized: true
};
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const publicPath = path.resolve(__dirname, "public");
//const PORT = 17884;

app.set('view engine', 'hbs');

//drops req.user into the context of every template
app.use(function(req, res, next){
	res.locals.user = req.user;
	next();
});
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

/*
app.post('/', function(req, res) {

	console.log(req.body);
	res.redirect('/');
});
*/


app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.post('/register', function(req, res) {
	if(!req.body.username) {
		res.render('register', {message: "Please enter username"});
	}
	else if (!req.body.password) {
		res.render('register', {message: "Please enter password"});
	}
	else {
		User.register(new User({username:req.body.username}), req.body.password, function(err, user) {
			if (err) {
				res.render('register', {message: "Could not complete registration"});
			}
			else {
				passport.authenticate('local')(req, res, function() {
					res.redirect('/allteams');
				});
			}
		});
	}
});

app.post('/login', function(req,res,next) {
  passport.authenticate('local', function(err,user) {
    if(user) {
      req.logIn(user, function(err) {
        res.redirect('/allteams');
      });
    } else {
      res.render('login', {message:'Your login or password is incorrect.'});
    }
  })(req, res, next);
});

app.get("/create-team", function(req, res) {
	res.render('create-team');
});

app.post('/create-team', function(req, res) {
	console.log(req.body);
	if(req.body.location === "" || req.body.location === null) {
		res.render("create-team", {message: "Your Team must have a location!"});
	}
	else if (req.body.mascot === "" || req.body.mascot === null) {
		res.render("create-team", {message: "Your Team must have a mascot!"});
	}
	else if (req.body.coach === "" || req.body.coach === null) {
		res.render("create-team", {message: "Your Team must have a coach!"});
	}
	else {
		new Team({
			location: req.body.location,
			mascot: req.body.mascot,
	  		color1: req.body.color1,
	  		color2: req.body.color2,
	  		coach: req.body.coach
		}).save(function(err, team, count) {
			if (err) {
				console.log("could not save new team\n");
				res.redirect('/allteams');
			}
			else {
				console.log("saved a new Team!\n");
				res.redirect('/allteams');
			}
		
		});
	}
});

app.get('/allteams', function(req,res) {
	Team.find(function(err, teams, count) {
		if(err || (!teams)) {
			console.log("could not find any teams\n");
			res.render('all-teams', {"teamExist": false}); //maybe i can just redirect them to a blank allteams page
		}
		else {
			console.log(teams);
			res.render('all-teams', {"teamExist": true, "teams": teams});
		}	
	});
});

app.get('/add-player', function(req,res) {
	res.render('add-player');
});

app.post('/add-player', function(req, res) {
	console.log(req.body);
	let teamName = req.body.team.toLowerCase();
	let tempName = teamName.split(" ");
	let teamSlug = tempName.join("-");

	Team.findOne({slug: teamSlug}, function(err, team) {
		if(err || (team === null)) {
			console.log("could not find that team\n");
			res.render("add-player", {message:'Could not find that team!'} );
		}
		else {

			if (req.body.name === null || req.body.name === "") {
				res.render("add-player", {message:'Please enter a name for your new player'} );
			}
			else {
				const newPlayer = new Player({
					team: teamSlug, 
	  				name: req.body.name,
	  				height: req.body.height,
	  				weight: req.body.weight,
	  				age: req.body.age,
	  				position: req.body.position,
	  				skills: req.body.skills
				});
				newPlayer.save(function(err, player) {
					if (err) {
						console.log("Could not save that new player to our DB\n");
					}
					else {
						console.log("Saved new player to our DB\n");
					}
				});
				team.roster.push(newPlayer);
				team.save(function(err, team) {
					if (err) {
						console.log("Could not save team after adding new Player\n");
					}
					else {
						console.log("Saved team with new player\n");
						console.log(team);
					}
				});
				res.redirect('/allteams')
			}
		}
	});
});


app.get('/remove-player', function(req,res) {
	res.render('remove-player');
});

app.post('/remove-player', function(req, res) {
	console.log(req.body);
	let teamName = req.body.team.toLowerCase();
	let tempName = teamName.split(" ");
	let teamSlug = tempName.join("-");

	Team.findOne({slug: teamSlug}, function(err, team) {
		if(err) {
			console.log("could not find that team\n");
			res.render("remove-player", {message:'Could not find that team!'} );
		}
		else {
			Player.findOneAndRemove({name: req.body.name}, function(err, player) {
				if (err) {
					console.log("could not find that player");
					res.render("remove-player", {message:'Could not find that player!'} );
				}
				else {
					const newRoster = team.roster.filter(plyr => plyr.name != player.name);
					team.roster = newRoster;
					team.save(function(err, team) {
						if (err) {
							console.log("Could not save team after removing Player\n");
						}
						else {
							console.log("Saved team with player removed\n");
							console.log(team);
						}
					});
					res.redirect('/allteams')
				}
			});
		}
	});
});

app.get('/remove-team', function(req, res) {
	res.render('remove-team');
});

app.post('/remove-team', function(req, res) {
	console.log(req.body);
	let teamName = req.body.team.toLowerCase();
	let tempName = teamName.split(" ");
	let teamSlug = tempName.join("-");
	Team.findOneAndRemove({slug: teamSlug}, function(err, team) {
		if (err) {
			console.log("Could not find that Team to remove\n");
			res.render('remove-team', {message: "Could not find that team!"});
		}
		else {
			res.redirect('allteams');
		}
	})
});

/*
app.get('/team', function(req, res) {
	Team.findOne({location: "Austin" }, function(err, team, count) {
		if(err) {
			console.log("could not find your team\n");
		}
		else if (team) {
			console.log(team);
			res.render('team-page', {"teamName": team.location});
		}
		else {
			console.log("could not find your team\n");
		}
	});
	//res.render('team-page', {"teamName": "NY"});
});




app.listen(process.env.PORT || 3000);
console.log("Connected\n");
*/

module.exports = app;