const mongoose = require('mongoose');



const Team = new mongoose.Schema({
  username: String,
  hash: // a password hash,
  location: String,
  mascot: String
  color1: String,
  color2: String,
  coach: String
  roster: [Player]
});

const Player = new mongoose.Schema({
  user: Team, 
  name: String,
  height: String,
  weight: Integer,
  age: Integer,
  position: String,
  attributes: [String],
});

mongoose.model('Player', Player);
mongoose.model('Cat', Cat);

mongoose.connect('mongod://localhost/teamdb');