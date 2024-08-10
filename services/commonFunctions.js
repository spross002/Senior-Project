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


module.exports = { 
    formatDate,
};