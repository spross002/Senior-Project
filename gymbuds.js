//Declare the requirements
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const crypto = require('crypto');

//Declare the express app
const app = express();
//This makes it so the HTML is in a human-readable format when rendered
app.locals.pretty = true;

app.use(express.urlencoded({ extended : true}));
app.use(express.static('public'));
app.use(bodyParser.json());

//Generate a secure random secret key
const secret = crypto.randomBytes(64).toString('hex')

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

app.use('/', require('./routes/accounts'))

app.listen(8080, () => {
    console.log('Server is running on port 8080')
});
