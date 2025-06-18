const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const sampleProducts = [
    // Electronics
    {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 199.99,
        category: "electronics",
        image: "https://example.com/headphones.jpg",
        rating: 4.5,
        stock: 50
    },
    {
        name: "Smart Watch",
        description: "Feature-rich smartwatch with health monitoring",
        price: 299.99,
        category: "electronics",
        image: "https://example.com/smartwatch.jpg",
        rating: 4.3,
        stock: 30
    },
    {
        name: "4K Smart TV",
        description: "55-inch 4K Ultra HD Smart LED TV",
        price: 699.99,
        category: "electronics",
        image: "https://example.com/tv.jpg",
        rating: 4.7,
        stock: 25
    },
    {
        name: "Gaming Laptop",
        description: "High-performance gaming laptop with RTX graphics",
        price: 1299.99,
        category: "electronics",
        image: "https://example.com/laptop.jpg",
        rating: 4.8,
        stock: 15
    },
    {
        name: "Wireless Earbuds",
        description: "True wireless earbuds with charging case",
        price: 149.99,
        category: "electronics",
        image: "https://example.com/earbuds.jpg",
        rating: 4.4,
        stock: 100
    },

    // Clothing
    {
        name: "Cotton T-Shirt",
        description: "Comfortable cotton t-shirt for everyday wear",
        price: 24.99,
        category: "clothing",
        image: "https://example.com/tshirt.jpg",
        rating: 4.0,
        stock: 100
    },
    {
        name: "Designer Jeans",
        description: "Premium quality designer jeans",
        price: 89.99,
        category: "clothing",
        image: "https://example.com/jeans.jpg",
        rating: 4.2,
        stock: 75
    },
    {
        name: "Winter Jacket",
        description: "Warm and stylish winter jacket",
        price: 149.99,
        category: "clothing",
        image: "https://example.com/jacket.jpg",
        rating: 4.6,
        stock: 40
    },
    {
        name: "Running Shoes",
        description: "Lightweight and comfortable running shoes",
        price: 79.99,
        category: "clothing",
        image: "https://example.com/shoes.jpg",
        rating: 4.5,
        stock: 60
    },
    {
        name: "Summer Dress",
        description: "Elegant summer dress for casual and formal occasions",
        price: 59.99,
        category: "clothing",
        image: "https://example.com/dress.jpg",
        rating: 4.3,
        stock: 45
    },

    // Books
    {
        name: "Bestselling Novel",
        description: "Award-winning fiction novel",
        price: 19.99,
        category: "books",
        image: "https://example.com/novel.jpg",
        rating: 4.7,
        stock: 200
    },
    {
        name: "Coffee Table Book",
        description: "Beautiful photography coffee table book",
        price: 49.99,
        category: "books",
        image: "https://example.com/coffee-table-book.jpg",
        rating: 4.4,
        stock: 40
    },
    {
        name: "Cookbook",
        description: "Collection of gourmet recipes",
        price: 34.99,
        category: "books",
        image: "https://example.com/cookbook.jpg",
        rating: 4.5,
        stock: 80
    },
    {
        name: "Self-Help Book",
        description: "Best-selling personal development guide",
        price: 24.99,
        category: "books",
        image: "https://example.com/self-help.jpg",
        rating: 4.6,
        stock: 150
    },
    {
        name: "Children's Book",
        description: "Illustrated children's storybook",
        price: 14.99,
        category: "books",
        image: "https://example.com/children-book.jpg",
        rating: 4.8,
        stock: 120
    },

    // Home
    {
        name: "Smart Home Speaker",
        description: "Voice-controlled smart home speaker",
        price: 149.99,
        category: "home",
        image: "https://example.com/speaker.jpg",
        rating: 4.6,
        stock: 60
    },
    {
        name: "Coffee Maker",
        description: "Programmable coffee maker with thermal carafe",
        price: 79.99,
        category: "home",
        image: "https://example.com/coffee-maker.jpg",
        rating: 4.4,
        stock: 45
    },
    {
        name: "Bedding Set",
        description: "Luxury cotton bedding set",
        price: 129.99,
        category: "home",
        image: "https://example.com/bedding.jpg",
        rating: 4.7,
        stock: 30
    },
    {
        name: "Smart Light Bulbs",
        description: "WiFi-enabled smart light bulbs",
        price: 39.99,
        category: "home",
        image: "https://example.com/light-bulbs.jpg",
        rating: 4.3,
        stock: 100
    },
    {
        name: "Kitchen Knife Set",
        description: "Professional-grade kitchen knife set",
        price: 199.99,
        category: "home",
        image: "https://example.com/knife-set.jpg",
        rating: 4.8,
        stock: 25
    },

    // Beauty
    {
        name: "Luxury Skincare Set",
        description: "Complete skincare routine set",
        price: 129.99,
        category: "beauty",
        image: "https://example.com/skincare.jpg",
        rating: 4.8,
        stock: 45
    },
    {
        name: "Perfume",
        description: "Elegant designer perfume",
        price: 89.99,
        category: "beauty",
        image: "https://example.com/perfume.jpg",
        rating: 4.5,
        stock: 60
    },
    {
        name: "Makeup Kit",
        description: "Professional makeup kit with brushes",
        price: 149.99,
        category: "beauty",
        image: "https://example.com/makeup.jpg",
        rating: 4.6,
        stock: 40
    },
    {
        name: "Hair Care Set",
        description: "Premium hair care products set",
        price: 69.99,
        category: "beauty",
        image: "https://example.com/hair-care.jpg",
        rating: 4.4,
        stock: 55
    },
    {
        name: "Spa Gift Set",
        description: "Luxury spa and relaxation gift set",
        price: 99.99,
        category: "beauty",
        image: "https://example.com/spa-set.jpg",
        rating: 4.7,
        stock: 35
    }
];

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    try {
        await connectDB();
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');
        
        // Insert sample products
        await Product.insertMany(sampleProducts);
        console.log('Sample products added successfully');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase(); 