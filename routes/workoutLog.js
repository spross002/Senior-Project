const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

//If logged in then allow contact addition and deletion and editing
const logged_in = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/unauthorized');
    }
}

//Unauthorized Page Render
router.get('/unauthorized', async (req, res) => {
    const userId = req.session.user ? req.session.user.id : -1;
    const user = await req.db.findUserById(userId);

    res.render('unauthorized');
})

//When a user clicks log out, the user session is abandoned and they are redirected to the home page
router.get('/logout', async (req, res) => {
    req.session.user = undefined;
    res.redirect('/');
});

//Renders a blank workout logging page
router.get('/newWorkout', logged_in, async (req, res) => {
    const userId = req.session.user ? req.session.user.id : -1;
    const user = await req.db.findUserById(userId);

    //Retreive all of the possible exercises from the exercises table
    const exercises = await req.db.getExercises();

    res.render('newWorkout', { user: user, exercises: exercises });
});

module.exports = router;
