const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

//This function checks if the user is logged in, redirecting to the unauthorized page if they are not
//This is done for security reasons. If a user is not logged in, we don't want them to be able to access certain pages
const logged_in = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/unauthorized');
    }
}




module.exports = router;