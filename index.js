var express = require('express')
    , app = express()
    , path = require('path')
    , passport = require('passport')
    , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , session = require('express-session')
    , LocalStrategy = require('passport-local').Strategy
    , GoogleStrategy = require('passport-google-oauth2').Strategy;

var GOOGLE_CLIENT_ID = "";
var GOOGLE_CLIENT_SECRET = ""
var sessionConfig = {
    secret: 'super session secret',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}

passport.serializeUser(function(user,done){
    done(null, user);
});

passport.deserializeUser(function(obj, done){
    done(null, obj);
});

passport.use(new LocalStrategy(
    function (username, password, callback) {
        //Logic check for username against DB
    }
));

passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/auth/google/callback",
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, callback){
        var user = {
            id: profile.id,
            username: "GoogleUser_" + profile.id
        }
        return callback(null, user);
    }
));

passport.use(new LocalStrategy(
    function(username, password, callback){
        if(username == "Erik"){
            var user = {
                id: 10,
                username: "ErikUserName",
                info: "Brown hair"
            }
            return callback(null, user);
        }
        return callback(null, false);
    }
));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));
app.use('/', express.static(path.join(__dirname, '/public')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
    passport.authenticate('google', {
        scope: [ 
            'https://www.googleapis.com/auth/plus.login'],
    }
));

app.get('/auth/google/callback', 
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login'
    }
));

app.post('/login', passport.authenticate('local', {failureRedirect: '/login'}),
    function(req, res){
        res.redirect('/');
    }
);

app.get('/', function(req, res){
    console.log("User is: " + req.user);
    res.render('index', req.user);
});

app.get('/login', function(req, res){
    res.render('login');
})



app.listen(8080);

function ensureAuthentication(req, res, next) {
    if(req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}