const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

/*
    Function: formatDate
    Paramaters: Date object
    Returns: Date object reformatted into "YYYY:MM:DD"
*/
const formatDate = (date) => {
    const currentDate = date
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
}

/*
    Function: calcDuration
    Parameters: start_time (string), end_time (string)
    Returns: The difference in minutes between two start times.
*/
const calcDuration = (start_time, end_time) => {

    function parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    // Parse the start and end times
    const start = parseTime(start_time);
    const end = parseTime(end_time);

    //If the end time is before the start time, that means it ends on the next day (for those late night lifters)
    // so, we need to account for that
    if(end < start){
        end.setDate(end.getDate() + 1);
    }

    //Calculates the workout time in milliseconds
    const diffMilliseconds = end - start;

    //Convert the milliseconds to minutes
    const diffMinutes = diffMilliseconds / (1000 * 60);

    return diffMinutes;
}


module.exports = { 
    formatDate,
    calcDuration,
};