const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Authentication failed'
        });
    }
}; 
// const express = require('express');
// const User = require('../models/User');

// const router = express.Router();

// // Signup API Route
// router.post('/signup', async (req, res) => {
//     console.log('Signup Request:', req.body); // Log request for debugging
//     try {
//         const { name, email, password } = req.body;

//         if (!name || !email || !password) {
//             return res.status(400).json({ message: 'All fields are required' });
//         }

//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         const newUser = new User({ name, email, password });
//         await newUser.save();

//         res.status(201).json({ message: 'User registered successfully' });
//     } catch (error) {
//         console.error('Signup Error:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// module.exports = router;
