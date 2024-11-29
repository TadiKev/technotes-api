// Import the mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Define a schema for the User model using mongoose.Schema
const userSchema = new mongoose.Schema({
    // Define a field for the username, which is a required string
    username: {
        type: String,
        required: true // This means the username is mandatory
    },
    // Define a field for the password, which is also a required string
    password: {
        type: String,
        required: true // Password is mandatory
    },
    // Define a field for roles, which is an array of strings with a default value of 'Employee'
    roles: {
        type: [String],
        default: ["Employee"] // If no role is provided, default is 'Employee'
    },
    // Define an active field that is a boolean, defaulting to true
    active: {
        type: Boolean,
        default: true // User is active by default
    }
});

// Export the User model, which will be created using the userSchema
module.exports = mongoose.model('User', userSchema);
