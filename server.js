require('dotenv').config(); // Load environment variables from a .env file
require ('express-async-errors')
const express = require('express');
const app = express();
const path = require('path');
const { logger } = require('./middleware/logger'); // Custom logger middleware
const errorHandler = require('./middleware/errorHandler'); // Custom error handling middleware
const cookieParser = require('cookie-parser'); // Middleware for parsing cookies
const cors = require('cors'); // Middleware for enabling CORS (Cross-Origin Resource Sharing)
const corsOptions = require('./config/corsOptions'); // CORS configuration options
const connectDB = require('./config/dbConn'); // Database connection setup
const mongoose = require('mongoose');
const { logEvents } = require('./middleware/logger');
const PORT = process.env.PORT || 3500; // Set the port to an environment variable or default to 3500

console.log(process.env.NODE_ENV); // Log the environment (development, production, etc.)

connectDB(); // Connect to MongoDB

app.use(logger); // Use custom logger middleware

app.use(cors(corsOptions)); // Use CORS with specific options

app.use(express.json()); // Middleware to parse incoming JSON requests

app.use(cookieParser()); // Middleware to parse cookies

app.use('/', express.static(path.join(__dirname, 'public'))); // Serve static files

app.use('/', require('./routes/root')); // Root route
app.use('/auth', require('./routes/authRoute'))
app.use('/users', require('./routes/userRoutes')); // User routes
app.use('/notes', require('./routes/noteRoutes')); // Notes routes

// Catch-all route for handling 404 errors
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html')); // Serve 404 page
    } else if (req.accepts('json')) {
        res.json({ message: "404 Not Found" }); // Send 404 JSON response
    } else {
        res.type('txt').send('404 Not Found'); // Send plain text response
    }
});

app.use(errorHandler); // Use custom error handling middleware

// Start the server and listen on the specified port
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on('error', err => {
    console.log(err);
    logEvents(`${err.no}:${err.code}\t${err.sycall}\t${err.hostname}`, 'mongoErrLog.log'); // Log MongoDB errors
});
