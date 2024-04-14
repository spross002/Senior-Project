const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

//When a user clicks log out, the user session is abandoned and they are redirected to the home page
router.get('/logout', async (req, res) => {
    req.session.user = undefined;
    res.redirect('/');
});

//Render the login page
router.get('/login', async (req, res) => {
    res.render('login', { hide_login: true });
});

//Login page functionality
router.post('/login', async (req, res) => {
    const username = req.body.username.trim();
    const p1 = req.body.password.trim();
    const user = await req.db.findUserByUsername(username);

    if (user && bcrypt.compareSync(p1, user.password)){
        req.session.user = user;

        //Note: currently redirects to home, but will instead redirect to a dashboard
        res.redirect('/');
        return;
    }else{
        res.render('login', { hide_login: true, message: 'Either username or password is incorrect' });
        return;
    }
})

//Render the signup page
router.get('/signup', async (req, res) => {
    res.render('signup', { hide_login: true });
});

//Signup page functionality
router.post('/signup', async (req, res) => {
    //Get all the information from the text boxes
    const first = req.body.first;
    const last = req.body.last;
    const username = req.body.username.trim();
    const password1 = req.body.password.trim();
    const password2 = req.body.password2.trim();

    //If the two passwords don't match, warn the user and make them re-submit
    if (password1 != password2){
        res.render('signup', { hide_login: true, message: 'Passwords do not match!' });
        return;
    }

    //Check if the user already exists and warn the user if it does
    const user = await req.db.findUserByUsername(username);
    if (user) {
        res.render('signup', { hide_login: true, message: 'This account already exists!' });
        return;
    }

    //Generate a salt hash for the password for a base level of password security
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password1, salt);

    //Create the user with the input information
    await req.db.createUser(first, last, username, hash);

    //This will be passed to the login page for it to know that the user just created an account and show the correct text
    const fromSignup = true;

    //Redirect the user to the login page in order for them to login
    res.render('login', { fromSignup });
});

module.exports = router;