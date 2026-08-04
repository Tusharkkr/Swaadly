import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { seedDatabase } from "./config/seedData.js";
import { uploadsDirectory } from "./config/paths.js";
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();
const port = process.env.PORT || 4000;
const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/images", express.static(uploadsDirectory));
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
    res.send("API Working");
});

app.use((error, req, res, next) => {
    if (error.message === "Origin is not allowed by CORS") {
        return res.status(403).json({ success: false, message: error.message });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
});

const startServer = async () => {
    await connectDB();
    await seedDatabase();
    app.listen(port, () => console.log(`Server started on ${port}`));
};

startServer().catch((error) => {
    console.error("Unable to start server:", error.message);
    process.exit(1);
});

export default app;