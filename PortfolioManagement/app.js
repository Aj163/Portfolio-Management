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
var getJSON = require('get-json');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: true});
var userID = -1;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/login', function(req, res) {
    res.render('login', {message: "", username: ""});
});

app.post('/login', urlencodedParser, function(req, res){
    var query = "SELECT UserID, Password FROM User WHERE Username=\"" + req.body.username + "\";";
    dbms.query(query, function(err, result, fields) {
        if (err) throw err;
        if(result.length == 0) {
            res.render('login', {message: "Invalid Username", username: req.body.username})
        }
        else if(req.body.password != result[0]["Password"]) {
            res.render('login', {message: "Wrong Password", username: req.body.username});
        }
        else {
            userID = result[0]["UserID"];
            res.redirect('/');
        }
    });
});


app.get('/watch-list', function(req, res){
    var query = "SELECT ShareName, Symbol FROM WatchList, Shares WHERE Shares.Symbol=WatchList.ShareSymbol;";
    dbms.query(query, function(err, result, fields) {
        if (err) throw err;
        res.render('watch_list', {data: result});
    });
});

app.get('/stock-list', function(req, res){
    var query = "SELECT ShareName, Symbol FROM Shares;";
    dbms.query(query, function(err, result, fields) {
        if (err) throw err;
        res.render('stock_list', {data: result});
    });
});

app.get('/share/:company', function(req, res){
    getJSON('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + req.params.company + '&apikey=ZQBDTSMTGR1O70Q9', function(err, data) {
        if (err) throw err;
        if (data["Error Message"]) {
            res.render('404');
        }
        else {
            var query = "SELECT ShareName FROM Shares WHERE Symbol=\"" + req.params.company + "\";";
            dbms.query(query, function(err, resultname, fields) {
                if (err) throw err;

                var existsQuery = "SELECT ShareSymbol FROM WatchList WHERE UserID=3 AND ShareSymbol=\"" + req.params.company + "\";";
                dbms.query(existsQuery, function(err, result, fields) {
                    if (err) throw err;
                    res.render('stock', {data: data, name: resultname, symbol: req.params.company, inWatchList: result.length > 0});
                });
            });
        }
    });
});

app.post('/add', urlencodedParser, function(req, res){
    var query = "INSERT INTO WatchList VALUES(3, \"" + req.body.symbol + "\");";
    dbms.query(query, function(err, result, fields) {
        if (err) throw err;
        res.redirect('watch-list');
    });
});

app.post('/remove', urlencodedParser, function(req, res){
    var query = "DELETE FROM WatchList WHERE UserID=3 AND ShareSymbol=\"" + req.body.symbol + "\";";
    dbms.query(query, function(err, result, fields) {
        if (err) throw err;
        res.redirect('watch-list');
    });
});

app.get('/:anything', function(req, res){
    res.render('404');
});

app.listen(3000);
console.log('Connect to http://127.0.0.1:3000/');

// Alpha-Vantage API Key : ZQBDTSMTGR1O70Q9
// https://www.alphavantage.co/documentation/