const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get product recommendations based on user preferences
router.post('/recommendations', async (req, res) => {
    try {
        const { preferences, priceRange, category } = req.body;
        
        // Build query based on user preferences
        let query = {};
        
        if (priceRange) {
            query.price = {
                $gte: priceRange.min || 0,
                $lte: priceRange.max || Number.MAX_VALUE
            };
        }
        
        if (category) {
            query.category = category;
        }
        
        // Get products matching the criteria
        const products = await Product.find(query)
            .limit(5)
            .sort({ rating: -1 });
            
        res.json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting recommendations',
            error: error.message
        });
    }
});

// Get personalized recommendations based on cart items
router.post('/personalized-recommendations', async (req, res) => {
    try {
        const { cartItems } = req.body;
        
        if (!cartItems || cartItems.length === 0) {
            return res.json({
                success: true,
                products: []
            });
        }
        
        // Get categories from cart items
        const categories = [...new Set(cartItems.map(item => item.category))];
        
        // Find similar products in the same categories
        const recommendations = await Product.find({
            category: { $in: categories },
            _id: { $nin: cartItems.map(item => item._id) }
        })
        .limit(5)
        .sort({ rating: -1 });
        
        res.json({
            success: true,
            products: recommendations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting personalized recommendations',
            error: error.message
        });
    }
});

module.exports = router; 