// ################################################################### MySQL

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


// ################################################################# Server

var express = require('express');
var app = express();
var getJSON = require('get-json');
var bodyParser = require('body-parser');
var userIDs = {};

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


// Home Page
app.get('/', function(req, res) {
    if (userIDs[req.connection.remoteAddress] == undefined) {
        res.redirect('/login');
    }
    else {
        res.render('index');
    }
});


// Login
app.get('/login', function(req, res) {
    res.render('login', {message: "", username: ""});
});


// Authenticating user
app.post('/login', function(req, res) {
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
            userIDs[req.connection.remoteAddress] = result[0]["UserID"];
            res.redirect('/');
        }
    });
});


// Signup
app.get('/signup', function(req, res) {
    res.render('signup', {message: "", username: "", firstname: "", lastname: ""});
});


// Signing up
app.post('/signup', function(req, res) {
    var query = "SELECT Username FROM User WHERE Username=\"" + req.body.username + "\";";
    dbms.query(query, function(err, result, fields) {
        if (err) throw err;
        if(req.body.username == "") {
            res.render('signup', {message: "Username is empty", username: req.body.username, 
                firstname: req.body.firstname, lastname: req.body.lastname})
        }
        else if(result.length == 1) {
            res.render('signup', {message: "Username exists", username: req.body.username, 
                firstname: req.body.firstname, lastname: req.body.lastname})
        }
        else if(req.body.password != req.body.confirm_password) {
            res.render('signup', {message: "Passwords don't match", username: req.body.username, 
                firstname: req.body.firstname, lastname: req.body.lastname})
        }
        else if(req.body.firstname == "") {
            res.render('signup', {message: "First name is empty", username: req.body.username, 
                firstname: req.body.firstname, lastname: req.body.lastname})
        }
        else {
            var insertQuery="INSERT INTO User(Username, Password, FirstName, LastName)" + 
                " VALUES(\"" + req.body.username + "\", \"" + req.body.password + "\", \"" +
                req.body.firstname + "\", \"" + req.body.lastname + "\");";

            dbms.query(insertQuery, function(err, result, fields) {
                if (err) throw err;

                var IDquery = "SELECT UserID FROM User WHERE Username=\"" + req.body.username + "\";";
                dbms.query(IDquery, function(err, result, fields) {
                    if (err) throw err;

                    userIDs[req.connection.remoteAddress] = result[0]["UserID"];
                    res.redirect('/');
                });
            });
        }
    });
});


// Logout
app.get('/logout', function(req, res) {
    userIDs[req.connection.remoteAddress] = undefined;
    res.redirect('/login');
});


// Watch List
app.get('/watch-list', function(req, res) {
    if (userIDs[req.connection.remoteAddress] == undefined) {
        res.redirect('/login');
    }
    else {
        var query = "SELECT ShareName, Symbol FROM WatchList, Shares WHERE Shares.Symbol=WatchList.ShareSymbol;";
        dbms.query(query, function(err, result, fields) {
            if (err) throw err;
            res.render('watch_list', {data: result});
        });
    }
});


// Stock List
app.get('/stock-list', function(req, res) {
    if (userIDs[req.connection.remoteAddress] == undefined) {
        res.redirect('/login');
    }
    else {
        var query = "SELECT ShareName, Symbol FROM Shares;";
        dbms.query(query, function(err, result, fields) {
            if (err) throw err;
            res.render('stock_list', {data: result});
        });
    }
});


// Stock page
app.get('/share/:company', function(req, res) {
    if (userIDs[req.connection.remoteAddress] == undefined) {
        res.redirect('/login');
    }
    else {
        getJSON('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=' + 
            req.params.company + '&interval=1min&apikey=ZQBDTSMTGR1O70Q9', function(err, data) {

            if (err) throw err;
            if (data["Error Message"]) {
                res.render('404');
            }
            else {
                var query = "SELECT ShareName FROM Shares WHERE Symbol=\"" + req.params.company + "\";";
                dbms.query(query, function(err, resultname, fields) {
                    if (err) throw err;

                    var existsQuery = "SELECT ShareSymbol FROM WatchList WHERE UserID=" + 
                        userIDs[req.connection.remoteAddress] + " AND ShareSymbol=\"" + 
                        req.params.company + "\";";

                    dbms.query(existsQuery, function(err, result, fields) {
                        if (err) throw err;

                        // Query number of existing shares
                        var bought = "SELECT SUM(Quantity) AS bought FROM UserHistory WHERE " + 
                            "UserID=" + userIDs[req.connection.remoteAddress] + " AND BuySellFlag=0 AND " + 
                            "ShareSymbol=\"" + req.params.company + "\";";

                        dbms.query(bought, function(err, bght, fields) {

                            if (err) throw err;
                            var sold = "SELECT SUM(Quantity) AS sold FROM UserHistory WHERE " + 
                                "UserID=" + userIDs[req.connection.remoteAddress] + " AND BuySellFlag=1 AND " + 
                                "ShareSymbol=\"" + req.params.company + "\";";

                            dbms.query(sold, function(err, sld, fields) {

                                if (err) throw err;
                                if (sld[0]["sold"] == null) {
                                    sld[0]["sold"] = 0;   
                                }

                                var current = bght[0]["bought"] - sld[0]["sold"];
                                res.render('stock', {data: data, name: resultname, symbol: 
                                    req.params.company, inWatchList: result.length > 0, current: current});
                            });
                        });
                        
                    });
                });
            }
        });
    }
});


// Buy share
app.post('/buy', function(req, res) {
    
    if(req.body.quantity == '') {
        res.redirect('/share/' + req.body.symbol);
    }
    else {
        var now = new Date();
        var timestamp = now.toISOString().substr(0, 10) + " " + 
            now.toISOString().substr(11, 8);

        var buyQuery = "INSERT INTO BuyShare VALUES (\"" + timestamp + "\", " + 
            userIDs[req.connection.remoteAddress] + ", " + req.body.quantity + 
            ", " + req.body.price + ", \"" + req.body.symbol + "\");";

        dbms.query(buyQuery, function(err, result, fields) {
            if (err) throw err;
            var historyQuery = "INSERT INTO UserHistory VALUES (" + userIDs[req.connection.remoteAddress]
                 + ", " + req.body.quantity + ", \"" + timestamp + "\", " + req.body.price + ", 0, \"" + 
                req.body.symbol + "\");";

            dbms.query(historyQuery, function(err, result, fields) {
                if (err) throw err;
                res.redirect('/share/' + req.body.symbol);
            });
        });
    }
});

// Add to watch list
app.post('/add', function(req, res) {
    var query = "INSERT INTO WatchList VALUES(" + userIDs[req.connection.remoteAddress] + ", \"" + 
        req.body.symbol + "\");";

    dbms.query(query, function(err, result, fields) {
        if (err) throw err;
        res.redirect('watch-list');
    });
});


// Remove from watch list
app.post('/remove', function(req, res) {
    var query = "DELETE FROM WatchList WHERE UserID=" + userIDs[req.connection.remoteAddress] + " AND ShareSymbol=\"" + req.body.symbol + "\";";
    dbms.query(query, function(err, result, fields) {
        if (err) throw err;
        res.redirect('watch-list');
    });
});


// 404 page not found
app.get('/:anything', function(req, res) {
    res.render('404');
});

app.listen(3000);
console.log('Connect to http://127.0.0.1:3000/');

// Alpha-Vantage API Key : ZQBDTSMTGR1O70Q9
// https://www.alphavantage.co/documentation/