import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import authRoutes from "./routes/auth";
import protectedRoutes from "./routes/protected";
import productRoutes from "./routes/product"; // Import product routes
import orderRoutes from "./routes/order"; // Import order routes
import cartRoutes from "./routes/cart"; // Import cart routes
import { createAdminUserIfNotExists } from "./utils/startup";
import { guestMiddleware } from "./middleware/guestMiddleware";
import { logRoutes } from "./utils/routeLogger";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(guestMiddleware);

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(
    JSON.stringify(
      {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        query: req.query,
        params: req.params,
        body: req.body,
        cookies: req.cookies,
      },
      null,
      2
    )
  );
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/products", productRoutes); // Add product routes
app.use("/api/orders", orderRoutes); // Add order routes
app.use("/api/cart", cartRoutes); // Add cart routes

app.get("/", (req, res) => {
  res.send("API is running...");
});

const port = parseInt(process.env.PORT || "3000");

// Create admin user on startup
createAdminUserIfNotExists()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
      logRoutes("/api/auth", authRoutes);
      logRoutes("/api", protectedRoutes);
      logRoutes("/api/products", productRoutes);
      logRoutes("/api/orders", orderRoutes);
      logRoutes("/api/cart", cartRoutes);
    });
  })
  .catch((error) => {
    console.error("Failed to create admin user:", error);
    process.exit(1);
  });
