// Import the allowedOrigins array, which contains the allowed origins for CORS
const allowedOrigins = require('./allowedOrigins');  

// Define CORS options for handling cross-origin requests
const corsOptions = {
    // Function to check if the request's origin is allowed
    origin: (origin, callback) => {  
        // Check if the origin exists in the allowedOrigins array or if it's undefined (undefined origin means requests like server-to-server)
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            // If the origin is allowed or there's no origin (like server-to-server requests), call the callback with no error and allow the request
            callback(null, true);
        } else {
            // If the origin is not allowed, return an error message
            callback(new Error('Not allowed by CORS'));
        }
    },
    // Allow credentials to be sent in cross-origin requests
    credentials: true,  
    
    // Set a success status for OPTIONS preflight requests (older browsers may require status 200 instead of 204)
    optionsSuccessStatus: 200
};

// Export the corsOptions object to be used in other parts of the app
module.exports = corsOptions;
