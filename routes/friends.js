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

//Render the friend's recaps dashboard page
router.get('/friends', logged_in, async (req, res) => {
    const userId = req.session.user ? req.session.user.id : -1;
    const user = await req.db.findUserById(userId);

    //Get the IDs of all the user's friends
    const friendsIds = await req.db.getAllFriends(userId);

    let friends = [];

    //Loop through the IDs and retrieve each user's information to pass on to the html.
    for(const user of friendsIds){
        friends.push(await req.db.findUserById(user.friend_id));
    }

    res.render('friends', { user: user, friends: friends })
})


module.exports = router;