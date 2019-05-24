var express=require('express');
var app=express();

//So we can read configuration files, load the file module
var fs=require('fs');

//Load the https module so we can run a secure server
var https=require('https');

//Define the location of the certificate and private key
var httpsServerOptions = {
	key: fs.readFileSync(__dirname + '/ssl/key.pem'),
	cert: fs.readFileSync(__dirname + '/ssl/cert.crt'),
}
app.set('httpsServerPort', process.env.PORT || 443);

var errorLog = require('./lib/errorLog.js');
var debugLog = require('./lib/debugLog.js');
debugLogFlag=true;

//Read in the configuration file
var configuration = require('./configuration/regservice-config.js');

debugLog("Loading the mongoose library")
//Setup mongo DB
var mongoose = require('mongoose');
var opts = {
	keepAlive: 1
};

debugLog("Connecting via mongoose to the Mongo DB")

switch(app.get('env')){
  case 'development':
    mongoose.connect(configuration.mongo.development.connectionString, opts);
    break;
  case 'production':
    mongoose.connect(configuration.mongo.production.connectionString, opts);
    break;
  default:
    throw new Error('Unknown execution environment: ' + app.get('env'));
}

debugLog("Configuring session management to use Mongo DB")


//This section is required for session management using a cookie session id and mongo
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

switch(app.get('env')){
  case 'development':
    app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: configuration.cookieSecret.development,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    }));
    break;
  case 'production':
    app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: configuration.cookieSecret.production,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    }));
    break;
  default:
    throw new Error('Unknown execution environment: ' + app.get('env'));
}



debugLog("Loading Mongo schemas")


//Add the Mongodb schema for customer entries
var User = require('./models/userschema.js');


var handlebars=require('express-handlebars').create({
	defaultLayout:'regservice',
});

debugLog("Loading handlebars engine")


app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

app.use(express.static(__dirname + '/public'));

debugLog("Loading body-parser")

app.use(require('body-parser').urlencoded({extended: true}));


//This section covers adding authentication providers using Passport
debugLog("Loading Passport")
var auth = require('./lib/auth.js')(app, {
    // baseURL is optional; it will default to localhost if you omit it;
    // it can be helpful to set this if you're not working on
    // your local machine.  For example if you were using a staging server,
    // you might set the BASE_URL environment variable to
    // https://staging.domainname.com
    baseURL: process.env.BASE_URL,
    providers: configuration.authProviders,
    successRedirect: '/',
    failureRedirect: '/login',
});
auth.init();
auth.registerRoutes();

debugLog("Setting up main routes")

//Declare home page route
app.get('/registration/',function(req,res) {
	//Start the initialization of all the cache data
 	res.render('registrationform');
});

app.post('/registration/',function(req,res) {
	debugLog('Form (from querystring): '+req.query.form);
	debugLog('CSRF token (from hidden form field): '+req.body._csrf);

    new User({
            username: req.body.username,
            password: req.body.password,   /* TODO: hash the password */
            domain: req.body.domain,        /*  TODO: Check the input of this field */
            screenname: req.body.screenname,
            email: req.body.email,
            role: req.body.role,
            created: Date.now()
    }).save(function(err) {
            if(err) {
                    errorLog('There was an error creating the new customer',err);
            }
    });

	debugLog('New customer should be saved, redirecting (303) now');

	res.redirect(303,'/user/list');
});


//Error handling
app.use(function(req,res,next) {
  res.status(404);
  res.render('404');
});

app.use(function(err,req,res,next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

https.createServer(httpsServerOptions, app).listen(app.get('httpsServerPort'), function () {
	console.log('Express started in '+app.get('env') + ' mode on port ' + app.get('httpsServerPort') + ' using HTTPS. ;press CTRL-C to terminate.');
});
