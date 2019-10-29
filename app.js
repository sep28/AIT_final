const express = require('express');
const app = express();
const path = require("path");
require('./db');
const mongoose = require('mongoose');
const Team = mongoose.model('Team');
const Player = mongoose.model('Player');
const publicPath = path.resolve(__dirname, "public");


app.use(function(req, res, next) {
	console.log("Method: " + req.method + "\n");
	console.log("Path: " + req.path + "\n");
	console.log("Query: ");
	console.log(req.query);
	console.log("\n");
	next();
});

app.set('view engine', 'hbs');






app.listen(3000);