const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.userId = decoded.userId;
        next();
    });
};

// Get user's cart
router.get('/', verifyToken, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.userId })
            .populate('items.productId');

        if (!cart) {
            cart = new Cart({ userId: req.userId, items: [] });
            await cart.save();
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
});

// Add item to cart
router.post('/add', verifyToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        let cart = await Cart.findOne({ userId: req.userId });
        if (!cart) {
            cart = new Cart({ userId: req.userId, items: [] });
        }

        // Check if product already in cart
        const existingItem = cart.items.find(item => 
            item.productId.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                productId,
                quantity,
                price: product.price
            });
        }

        cart.calculateTotal();
        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart', error: error.message });
    }
});

// Update cart item quantity
router.put('/update/:productId', verifyToken, async (req, res) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;

        const cart = await Cart.findOne({ userId: req.userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => 
            item.productId.toString() === productId
        );

        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Check stock
        const product = await Product.findById(productId);
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        item.quantity = quantity;
        cart.calculateTotal();
        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart', error: error.message });
    }
});

// Remove item from cart
router.delete('/remove/:productId', verifyToken, async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ userId: req.userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => 
            item.productId.toString() !== productId
        );

        cart.calculateTotal();
        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error removing from cart', error: error.message });
    }
});

// Clear cart
router.delete('/clear', verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error clearing cart', error: error.message });
    }
});

module.exports = router; 