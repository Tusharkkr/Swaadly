import express from "express";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import multer from "multer";
import fs from "fs";
import { uploadsDirectory } from "../config/paths.js";

const foodRouter = express.Router();
fs.mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadsDirectory,
    filename: (req, file, cb) => {
        const extension = file.originalname.includes(".")
            ? file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase()
            : "";
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("image/")) {
            return callback(new Error("Only image files are allowed"));
        }
        return callback(null, true);
    }
});

const uploadFoodImage = (req, res, next) => {
    upload.single("image")(req, res, (error) => {
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
        return next();
    });
};

foodRouter.get("/list", listFood);
foodRouter.post("/add", uploadFoodImage, addFood);
foodRouter.post("/remove", removeFood);

export default foodRouter;