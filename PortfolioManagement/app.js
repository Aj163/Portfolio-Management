// MySQL
var mysql = require('mysql');

var dbms = mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "admin"
});

dbms.connect(function(err) {
    if (err) throw err;

    dbms.query("USE Portfolio;", function (err, result) {
        if (err) throw err;
        console.log(">> Successfully connected to Portfolio Database");
    });
});


// Server
var express = require('express');
var app = express();

app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render('index');
});

app.get('/watch-list', function(req, res){
    dbms.query("SELECT ShareName FROM WatchList, Shares WHERE Shares.Symbol=WatchList.ShareSymbol;", function(err, result, fields) {
        if(err) throw err;
        res.render('watch_list', {data: result});
    });
});

app.get('/:anything', function(req, res){
    res.render('404');
});

app.listen(3000);
console.log('Connect to http://127.0.0.1:3000/');

// Alpha-Vantage API Key : ZQBDTSMTGR1O70Q9