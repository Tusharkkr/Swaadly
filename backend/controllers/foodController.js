import foodModel from "../models/foodModel.js";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { uploadsDirectory } from "../config/paths.js";

const removeUploadedFile = async (filename) => {
    if (!filename) return;
    try {
        await fs.unlink(path.join(uploadsDirectory, path.basename(filename)));
    } catch (error) {
        if (error.code !== "ENOENT") console.error(error);
    }
};

const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({}).sort({ name: 1 });
        return res.json({ success: true, data: foods });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Unable to load foods" });
    }
};

const addFood = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Food image is required" });
    }

    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
    const category = typeof req.body.category === "string" ? req.body.category.trim() : "";
    const price = Number(req.body.price);

    if (!name || !description || !category || !Number.isFinite(price) || price < 0) {
        await removeUploadedFile(req.file.filename);
        return res.status(400).json({ success: false, message: "Invalid food details" });
    }

    try {
        await foodModel.create({
            name,
            description,
            price,
            category,
            image: req.file.filename
        });
        return res.json({ success: true, message: "Food Added" });
    } catch (error) {
        await removeUploadedFile(req.file.filename);
        console.error(error);
        return res.status(500).json({ success: false, message: "Unable to add food" });
    }
};

const removeFood = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.body.id)) {
            return res.status(400).json({ success: false, message: "Invalid food id" });
        }

        const food = await foodModel.findByIdAndDelete(req.body.id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food not found" });
        }

        await removeUploadedFile(food.image);
        return res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Unable to remove food" });
    }
};

export { listFood, addFood, removeFood };