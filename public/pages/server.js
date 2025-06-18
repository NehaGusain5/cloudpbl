require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth.js");

// Models for storing form data
const Contact = require("./models/Contact");
const Feedback = require("./models/Feedback");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cloudcart", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use("/api", authRoutes);

// Serve pages
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "public", "signup.html")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// ✅ Contact Form Route (POST)
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "All fields are required!" });
  }

  try {
    const contact = new Contact({ name, email, message });
    await contact.save();
    console.log(`📩 Contact Form Saved:`, contact);
    res.status(200).json({ success: true, message: "Contact form submitted successfully!" });
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again!" });
  }
});

// ✅ Feedback Form Route (POST)
app.post("/feedback", async (req, res) => {
  const { rating, feedback } = req.body;

  if (!rating || !feedback) {
    return res.status(400).json({ success: false, message: "All fields are required!" });
  }

  try {
    const feedbackEntry = new Feedback({ rating, feedback });
    await feedbackEntry.save();
    console.log(`📝 Feedback Saved:`, feedbackEntry);
    res.status(200).json({ success: true, message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again!" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🚨 Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));