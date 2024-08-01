const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

//This function checks if the user is logged in (for authorization)
const logged_in = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/unauthorized');
    }
}

module.exports = router;