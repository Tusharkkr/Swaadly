import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const authMiddleware = (req, res, next) => {
    const token = req.headers.token || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
        return res.status(401).json({ success: false, message: "Not Authorized Login Again" });
    }
    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ success: false, message: "JWT_SECRET is not configured" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.id || !mongoose.isValidObjectId(decoded.id)) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        req.userId = decoded.id;
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export default authMiddleware;