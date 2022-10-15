var express = require("express");

var app = express();

app.use("/node_modules", express.static("./node_modules"));
app.use("/", express.static("./app"));

app.listen(8080, function () {
    console.log("HTTP Server running on port 8080");
});
