// Import the `format` function from the `date-fns` package to format dates
const { format } = require('date-fns');

// Import the `v4` method from the `uuid` package to generate unique IDs
const { v4: uuid } = require('uuid');

// Import the core Node.js file system module (fs) for reading and writing files
const fs = require('fs');

// Use fs.promises to work with promises for async file system operations
const fsPromises = require('fs').promises;

// Import the `path` module to handle and transform file paths
const path = require('path');

// Async function to log events to a specified file
const logEvents = async (message, logFileName) => {
  // Format the current date and time using `date-fns`
  const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;

  // Create a log entry containing the timestamp, unique ID, and the message
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    // Check if the 'logs' directory exists, if not, create it
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
      await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
    }

    // Append the log entry to the specified log file (e.g., reqlog.log)
    await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem);
  } catch (err) {
    // Log any errors that occur during the logging process
    console.log(err);
  }
};

// Express middleware function to log HTTP requests
const logger = (req, res, next) => {
  // Log the request method, URL, and origin to a log file
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqlog.log');

  // Output the request method and path to the console
  console.log(`${req.method} ${req.path}`);

  // Pass control to the next middleware function in the stack
  next();
};

// Export the logEvents and logger functions to be used in other parts of the app
module.exports = { logEvents, logger };
