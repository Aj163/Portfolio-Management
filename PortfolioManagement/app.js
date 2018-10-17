// MySQL
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "admin"
});

con.connect(function(err) {
    if (err) throw err;

    con.query("USE Portfolio;", function (err, result) {
        if (err) throw err;
        console.log("-- Successfully connected to Portfolio Database --");
    });
});


// Server
var express = require('express');
var app = express();

app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render('index');
});

app.listen(3000);
console.log('Listening to port 3000');
console.log('Connect to http://127.0.0.1:3000/');