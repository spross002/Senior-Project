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

//Render the main dashboard page
router.get('/dashboard', logged_in, async (req, res) => {
    const userId = req.session.user ? req.session.user.id : -1;
    const user = await req.db.findUserById(userId);

    //This retreives all of the user's workouts from the database in order to list them for the user to see them
    let workouts = await req.db.getAllWorkouts(userId);

    //Make sure the workouts are sorted in ascending date.
    workouts.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    })

    //This retreives all of the user's logged sports activies from the database in order to list them for the user to see them
    let sports = await req.db.getAllSportsActivity(userId);

    //Make sure the sports are sorted in ascending date.
    sports.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    })

    
    res.render('dashboard', { user: user, workouts: workouts, sports: sports });
});


//Render the weekly recaps dashboard page
router.get('/recaps-weekly', logged_in, async (req, res) => {
    const userId = req.session.user ? req.session.user.id : -1;
    const user = await req.db.findUserById(userId);

    res.render('recaps-weekly', { user: user })
})

module.exports = router;
