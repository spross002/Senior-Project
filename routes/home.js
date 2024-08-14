const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

/*
    Sebastian Pross - Home

    HOME.JS

    This javascript page holds all of the backend functions pertaining to the home page.

    In order:

        router.get('/')
            --> This function calls the render function for the home page.
            
*/

//This function checks if the user is logged in (for authorization)
const logged_in = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/unauthorized');
    }
}

//Home Page rendering
router.get('/', async(req, res) => {
    //Check if the session has a user logged in
    const userId = req.session.user ? req.session.user.id : -1;
    const user = await req.db.findUserById(userId);

    //Render the home page with the active user information
    res.render('home', { user: user });
});

module.exports = router;