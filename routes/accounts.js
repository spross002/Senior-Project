const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');


/*
    Sebastian Pross - Accounts

    ACCOUNTS.JS:

        This javascript page holds all of the backend functions pertaining to anything related to a profile.
        That includes login, signup, profile editing, and password change.

        In order:

            router.get(/logout)
                --> This function is purely for the 'logout' button, and logs the user out of the session, redirecting them to the home page.


            router.get(/login)
                --> This function calls the render function for the login page
            router.post(/login)
                --> This function posts the login page, taking the input information and logging the user in. 


            router.get(/signup)
                --> This function calls the render function for the signup page
            router.post(/signup)
                --> This function posts the signup page, taking the input information and creating a new account in the database, issuing an error 
                    if the account already exists.

            
            router.get(/profile)
                --> This function calls the render function for the profile viewing page
            router.post(/profile)
                --> This function posts the profile page, if the user inputs a new name or email, and changeds it in the database


            router.get(/pswdchange)
                --> This function calls the render function for the password changing page
            router.post(/pswdchange)
                --> This function posts the password change page, taking the user's new password and changing it in the database


*/

//This function checks if the user is logged in, redirecting to the unauthorized page if they are not
//This is done for security reasons. If a user is not logged in, we don't want them to be able to access certain pages
const logged_in = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/unauthorized');
    }
}

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
        res.render('login', { hide_login: true, message: 'Either username or password is incorrect.' });
        return;
    }
})

//Render the signup page
router.get('/signup', async (req, res) => {
    res.render('signup', { hide_login: true });
});

//Signup page functionality
router.post('/signup', async (req, res) => {
    //Retreive all the user's input information from the text boxes
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

//Render the profile settings page
router.get('/profile', logged_in, async (req, res) => {
    //Check if the session has a user logged in
    const userId = req.session.user ? req.session.user.id : -1;
    const user = await req.db.findUserById(userId);

    //Render the proile page with the active user information
    res.render('profile', { user: user });
});

//Profile settings page functionality
router.post('/profile', async (req, res) => {
    //Find the current user
    const userId = req.session.user.id;
    const user = await req.db.findUserById(userId);

    let newFirst = req.body.first;
    let newLast = req.body.last;
    let newUsername = req.body.username.trim();

    //Check if the user already exists and warn the user if it does
    const userTest = await req.db.findUserByUsername(newUsername);
    if (userTest) {
        res.render('profile', { user: user, hide_login: true, message: 'This username already exists!' });
        return;
    }

    //This block checks to see if any of the post forms were empty, and fills it with the old info to properly
    // call updateUser with all the information
    if(!newFirst){
        newFirst = user.first_name;
    }

    if(!newLast){
        newLast = user.last_name;
    }

    if(!newUsername){
        newUsername = user.username;
    }

    //Sends a request to the server to update the user with the new information
    await req.db.updateUser(userId, newFirst, newLast, newUsername);

    //Gets the new user's information to re-render the page with the updated information
    const updatedUser = await req.db.findUserById(userId);

    //Re-render the profile page with the updated information
    res.render('profile', { user: updatedUser });
});

//Render the password change page
router.get('/pswdchange', logged_in, async (req, res) => {
    //Check if the session has a user logged in
    const userId = req.session.user ? req.session.user.id : -1;
    const user = await req.db.findUserById(userId);

    //Render the proile page with the active user information
    res.render('pswdchange', { user: user });
});

//Password change functionality
router.post('/pswdchange', async (req, res) => {
    //Find the current user
    const userId = req.session.user.id;
    const user = await req.db.findUserById(userId);

    const password1 = req.body.password.trim();
    const password2 = req.body.password2.trim();

    //If the two passwords don't match, warn the user and make them re-submit
    if (password1 != password2){
        res.render('pswdchange', { user: user, hide_login: true, message: 'Passwords do not match!', success: false });
        return;
    }

    //Generate a salt hash for the password for a base level of password security
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password1, salt);

    await req.db.updateUserPassword(userId, hash);

    res.render('pswdchange', { user: user, message: "Password successfully updated!", success: true })
});

module.exports = router;