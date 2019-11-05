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


mongoose.connect("mongodb://127.0.0.1:27017/teamdb", {useNewUrlParser: true}, function(err) {
  if (err) {
    console.log("Could not connect to mongodb ");
  }
  else {
    console.log("Connected to mongodb");
  }
});