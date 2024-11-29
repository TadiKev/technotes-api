const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// @desc Login
// @route POST /auth
// @access Public


const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Check if the user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' }); // Unauthorized
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create access token
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    username: user.username,
                    roles: user.roles,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' } // Access token valid for 15 minutes
        );

        // Optionally, create a refresh token
        const refreshToken = jwt.sign(
            { username: user.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' } // Refresh token valid for 7 days
        );

        // Store the refresh token in a secure cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true, // Cookie only accessible by the web server
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'Strict', // Prevent CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        });

        // Respond with the access token
        res.json({ accessToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};




// @desc Sign Up
// @route POST /auth/signup
// @access Public
const signup = async (req, res) => {
    const { username, password } = req.body

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ username }).exec()
    if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' })
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create a new user
    const newUser = new User({
        username,
        password: hashedPassword,
        roles: ['user'], // Default role; adjust if needed
        active: true // Set the user to active by default
    })

    try {
        const savedUser = await newUser.save()

        // Generate an access token for the new user
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": savedUser.username,
                    "roles": savedUser.roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )

        // Generate a refresh token and set it in the cookie
        const refreshToken = jwt.sign(
            { "username": savedUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        )

        // Create secure cookie with refresh token
        res.cookie('jwt', refreshToken, {
            httpOnly: true, //accessible only by web server 
            secure: true, //https
            sameSite: 'None', //cross-site cookie 
            maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
        })

        // Send response with the access token
        res.status(201).json({ accessToken })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error creating user' })
    }
}

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ username: decoded.username }).exec()

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ accessToken })
        }
    )
}

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    signup,
    refresh,
    logout
}
