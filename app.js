var express = require ("express");
var mongoose = require("mongoose");
var favicon = require('serve-favicon');
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var flash = require("connect-flash");
var morgan = require('morgan');
var passport=require("passport");

var routes = require("./routes");
var passportsetup=require("./passportsetup");
var app = express();

var { url } = require('./config/database.js');
mongoose.connect(url,{
    useNewUrlParser: true
});

passportsetup();

app.set("port",process.env.PORT || 3000);

app.set("views", path.resolve(__dirname,"views"));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set("view engine","ejs");
app.use(express.static("public"));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret:"Hola",
    resave:true,
    saveUninitialized: true
}));

app.use(flash());

app.use(passport.initialize({
    userProperty: "User"
}));
app.use(passport.session());

app.use(routes);

app.listen(app.get("port"),()=>{
    console.log("La aplicacion inicio por el puerto " + app.get("port"));
});
