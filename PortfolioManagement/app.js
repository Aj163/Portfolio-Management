var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "admin"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    con.query("USE Portfolio;", function (err, result) {
        if (err) throw err;
        console.log("Using Portfolio...");
    });

    con.query("SELECT * FROM User;", function (err, result) {
        if (err) throw err;
        console.log(result[0].FirstName);
    });
});