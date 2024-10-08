//Declare the requirements
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const UserDB = require('./userDB');
const db = new UserDB('./gymbuds.db');

//Initializes the database and makes all of the needed tables in the database.
db.initialize();
db.makeUserTable();
db.makeWorkoutTable();
db.makeExercisesTable();
db.makeUserExercisesTable();
db.makeFriendsTable();
db.makeSportsActivityTable();
db.makeSportsTable();
db.makeRecapTable();

//Only happens on creation - fills the necessary tables from the JSON files.
db.fillExercisesTable();
db.fillSportsTable();

//Declare the express app
const app = express();
//This makes it so the HTML is in a human-readable format when rendered
app.locals.pretty = true;

app.use(express.urlencoded({ extended : true}));
app.use(express.static('public'));
app.use(bodyParser.json());

//Generate a secure random secret key
const secret = crypto.randomBytes(64).toString('hex');

// Gets call on every request, before the routes.
// We can inject dependencies into the req (or res)
// so the routes have access to them.
app.use((req, res, next) => {
    console.log("Adding DB to request");
    req.db = db;
    next();
})

//Use express-session with the crypto middleware to have a randomly generated secret
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use((req, res, next) => {
    if(req.session.user){
        res.locals.user = {
            id: req.session.user.id,
            username: req.session.user.username
        }
    }
    next()
})

app.set('view engine', 'pug');

//This tells express to read all of the javascript files
app.use('/', require('./routes/accounts'))
app.use('/', require('./routes/home'))
app.use('/', require('./routes/dashboard'))
app.use('/', require('./routes/workoutLog'))
app.use('/', require('./routes/recap'))
app.use('/', require('./routes/friends'))

//This tells express to read the service javascript files
const { calculateWeeklyBreakdown } = require('./services/weeklyBreakdown');

//This renders a custom page for 404 errors.
app.use((req, res, next) => {
    res.status(404).render('404');
})

app.listen(8080, () => {
    console.log('Server is running on port 8080')
});


