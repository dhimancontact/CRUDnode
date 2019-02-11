const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

// adding this for validation
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
// added {matchedDaata, sanitize} in case i need to use sanitize later not used yet

// init app  pointing app to use express
const app = express();

// errors trying to get express validator working
app.use(expressValidator());

// local docker mongoDB 
// we had mongoose.connect('mongodb://localhost:27017');
// however we are now redeclaring it through variables.  the new variable now points to
// the config folder databse.js   config is declared on line 9ish 
mongoose.connect(config.database);
let db = mongoose.connection;

// check connection
db.once('open', function() {
    console.log('Connected to MongoDB');
});

//check for DB errors
db.on('error', function(err) {
    console.log(err);
});


// express() .use bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// middleware express-session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// middlewar express-messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// middleware express validator
// Express Validator Middleware has been updated and is no longer required


// set public folder let express know this is the static public folder
// reminder __dirname (double underscore) is the current directory
app.use(express.static(path.join(__dirname, 'public')));


// bring in Models
let Article = require('./models/article');

// load view engine
app.set('views', path.join(__dirname, 'views'));
// define view enging as pug
app.set('view engine', 'pug');

// Passport config  from config folder passport.js but then (passport) we pass in the passport value.
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// * is for all variables.. IF we are logged in req.user || or null if we are not.
app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// home route
app.get('/', function(req, res) {
    // {} becuase we want ALL articles
    Article.find({}, function(err, articles) {
        // if err render err, else give us the articles as intended
        if(err) {
            console.log(err);
        } else {
            // index.pug is index in /views
            res.render('index', {
                pageTitle: 'Articles',
                articles: articles
            });
        }
    });
});

// Route files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);
// anything using /articles is going to now point to './routes/articles' in another folder
// simply saying hey articles is that and anything asking for /articles is pointing to that folder now.

//start server
app.listen(3000, function() {
    console.log('server started on port 3000');
});
