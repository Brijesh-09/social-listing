import express from "express";
import cors from "cors";

// Import routes
import searchRoutes from "./routes/search.route.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/api/search", searchRoutes);

// Optional: Health check route
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

export { app };
