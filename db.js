const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

mongoose.set('bufferCommands', false);

const Team = new mongoose.Schema({
  //username: String,
  //hash:  a password hash,
  location: String,
  mascot: String,
  color1: String,
  color2: String,
  coach: String,
  //roster: [Player]
});

const Player = new mongoose.Schema({
  user: Team, 
  name: String,
  height: String,
  weight: String,
  age: String,
  position: String,
  attributes: [String],
});

Team.plugin(URLSlugs('location mascot'));

mongoose.model('Team', Team);
mongoose.model('Player', Player);

// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
	 // if we're in PRODUCTION mode, then read the configration from a file
 	// use blocking file io to do this...
 	const fs = require('fs');
 	const path = require('path');
 	const fn = path.join(__dirname, 'config.json');
 	const data = fs.readFileSync(fn);

 	// our configuration file will be in json, so parse it and set the
 	// conenction string appropriately!
 	const conf = JSON.parse(data);
 	dbconf = conf.dbconf;

} else {
 	// if we're not in PRODUCTION mode, then use
 	dbconf = 'mongodb://localhost/sa3736';
}

mongoose.connect(dbconf, {useNewUrlParser: true}, function(err) {
  if (err) {
	console.log("Could not connect to mongodb ");
  }
  else {
    console.log("Connected to mongodb");
  }
});