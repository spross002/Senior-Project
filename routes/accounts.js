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


//Render the signup page
router.get('/signup', async (req, res) => {
    res.render('signup', { hide_login: true });
});

//Post the signup page
router.post('/signup', async (req, res) => {
    //Get all the information from the text boxes
    const first = req.body.first;
    const last = req.body.last;
    const username = req.body.username.trim();
    const password1 = req.body.password.trim();
    const password2 = req.body.password2.trim();

    if (password1 != password2){
        res.render('signup', { hide_login: true, message: 'Passwords do not match!' });
        return;
    }
});


module.exports = router;