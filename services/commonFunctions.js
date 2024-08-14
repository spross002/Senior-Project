const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

/*

    NAME:
        formatDate() - Formats a date entry to "YYYY:MM:DD" format.

    SYNOPSIS:
        const formatDate(date);

        date --> The date to be formatted (Ex: "Mon July 4 2024") to "YYYY:MM:DD" (object)

    DESCRIPTION:
        Takes the date object entered, and gets the year, month, and day, formatting it into 
        YYYY:MM:DD

    RETURNS:
        Returns a string of the formatted date.

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

    NAME:
        calcDuration() - Calculates the difference in minutes between a start and end time.

    SYNOPSIS:
        const calcDuration(start_time, end_time);

        start_time --> The start time (string)
        end_time -->  The end time (string)

    DESCRIPTION:
        Takes the start time and end time of a workout and calculates the difference between the two
        in order for the duration of the workout to be saved in the workout entry

    RETURNS:
        Returns an integer of the difference between the times in minutes.

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


//This exports the two functions so they can be used in other files.
module.exports = { 
    formatDate,
    calcDuration,
};