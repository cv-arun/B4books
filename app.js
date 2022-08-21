var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const sessions = require('express-session')
const mongoose = require("mongoose");
const fileupload = require('express-fileupload')
const MongodbSession = require('connect-mongodb-session')(sessions)
const hbs = require('express-handlebars');


var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');

var app = express();
const mongoURI = "mongodb://localhost:27017/BBooks";
mongoose.connect(mongoURI).then((res) => {
  console.log("mongodb connected")
})


const store = new MongodbSession({
  uri: mongoURI,
  collection: 'mySessions',
})







app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials',
  helpers: {

    json: function (context) {
      return JSON.stringify(context);
    },
    inc1: function (context) {
      return context + 1
    },
    plus: function (parameter1, parameter2) {
      return parseInt(parameter1) + parseInt(parameter2)
    },
    divide: function (parameter1, parameter2) {
      return parseInt(parameter1) / parseInt(parameter2)
    },
    format: function (context) {
      return context.toUTCString()
    },
    star: function (rating) {
      let stars = ""
      for (let i = 1; i <= rating; i++) {
        stars = stars + '⭐'
      }
      return stars
    },
  }
}))




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload())

app.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized: true,
  cookie: { maxAge: 3600000 },
  resave: false,
  store: store
}));

app.use(function (req, res, next) {
  if (!req.session.userlogedin) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
  }
  next();
});

app.use(function (req, res, next) {
  if (!req.session.adminlogedin) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
  }
  next();
});



app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
