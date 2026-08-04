import "dotenv/config";
import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import Stripe from "stripe";

const isStripeConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_SECRET_KEY !== "sk_test_replace-me" &&
    !process.env.STRIPE_SECRET_KEY.includes("replace-me") &&
    process.env.STRIPE_SECRET_KEY.startsWith("sk_")
);
const stripe = isStripeConfigured ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const currency = process.env.STRIPE_CURRENCY || "usd";
const configuredDeliveryCharge = Number(process.env.DELIVERY_CHARGE);
const deliveryCharge = Number.isFinite(configuredDeliveryCharge) && configuredDeliveryCharge >= 0
    ? configuredDeliveryCharge
    : 5;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const placeOrder = async (req, res) => {
    let newOrder;
    try {
        if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
            return res.status(400).json({ success: false, message: "Order must contain at least one item" });
        }
        if (!req.body.address || typeof req.body.address !== "object" || Array.isArray(req.body.address)) {
            return res.status(400).json({ success: false, message: "Delivery address is required" });
        }

        const requestedItems = req.body.items;
        const invalidItem = requestedItems.find((item) => {
            return !item || !mongoose.isValidObjectId(item._id);
        });
        if (invalidItem) {
            return res.status(400).json({ success: false, message: "Invalid order item" });
        }

        const foodIds = requestedItems.map((item) => item._id);
        const foods = await foodModel.find({ _id: { $in: foodIds } });
        const foodsById = new Map(foods.map((food) => [food._id.toString(), food]));
        const orderItems = requestedItems.map((item) => {
            const food = foodsById.get(String(item._id));
            const quantity = Number(item.quantity);
            if (!food || !Number.isInteger(quantity) || quantity < 1) {
                throw new Error("Invalid order item");
            }
            return { ...food.toObject(), quantity };
        });

        const amount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0) + deliveryCharge;
        newOrder = await orderModel.create({
            userId: req.userId,
            items: orderItems,
            amount,
            address: req.body.address,
            payment: !stripe // auto-mark paid if Stripe is not configured
        });

        if (stripe) {
            try {
                const lineItems = orderItems.map((item) => ({
                    price_data: {
                        currency,
                        product_data: { name: item.name },
                        unit_amount: Math.round(item.price * 100)
                    },
                    quantity: item.quantity
                }));
                lineItems.push({
                    price_data: {
                        currency,
                        product_data: { name: "Delivery Charge" },
                        unit_amount: Math.round(deliveryCharge * 100)
                    },
                    quantity: 1
                });

                const session = await stripe.checkout.sessions.create({
                    success_url: `${frontendUrl}/verify?success=true&orderId=${newOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${frontendUrl}/verify?success=false&orderId=${newOrder._id}`,
                    line_items: lineItems,
                    mode: "payment",
                    metadata: {
                        orderId: newOrder._id.toString(),
                        userId: req.userId.toString()
                    }
                });

                await userModel.findByIdAndUpdate(req.userId, { cartData: {} });
                return res.json({ success: true, session_url: session.url });
            } catch (stripeErr) {
                console.error("Stripe Checkout Error, placing order in demo mode:", stripeErr.message);
                await orderModel.findByIdAndUpdate(newOrder._id, { payment: true });
                await userModel.findByIdAndUpdate(req.userId, { cartData: {} });
                return res.json({ success: true, session_url: `${frontendUrl}/myorders` });
            }
        }

        // Demo / COD fallback when Stripe key is not configured
        await userModel.findByIdAndUpdate(req.userId, { cartData: {} });
        return res.json({ success: true, session_url: `${frontendUrl}/myorders` });
    } catch (error) {
        if (newOrder?._id) {
            await orderModel.findByIdAndDelete(newOrder._id).catch((cleanupError) => console.error(cleanupError));
        }
        console.error(error);
        return res.status(400).json({ success: false, message: error.message || "Unable to place order" });
    }
};

const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 });
        return res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Unable to load orders" });
    }
};

const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.userId }).sort({ date: -1 });
        return res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Unable to load orders" });
    }
};

const updateStatus = async (req, res) => {
    const allowedStatuses = ["Food Processing", "Out for delivery", "Delivered"];
    if (!mongoose.isValidObjectId(req.body.orderId)) {
        return res.status(400).json({ success: false, message: "Invalid order id" });
    }
    if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({ success: false, message: "Invalid order status" });
    }

    try {
        const order = await orderModel.findByIdAndUpdate(
            req.body.orderId,
            { status: req.body.status },
            { new: true, runValidators: true }
        );
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        return res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Unable to update order status" });
    }
};

const verifyOrder = async (req, res) => {
    const { orderId, success, sessionId } = req.body;
    if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({ success: false, message: "Invalid order id" });
    }
    if (success !== "true") {
        return res.json({ success: false, message: "Payment not completed" });
    }
    if (!stripe || !sessionId) {
        return res.status(400).json({ success: false, message: "Payment session is required" });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.metadata?.orderId !== orderId || session.payment_status !== "paid") {
            return res.status(400).json({ success: false, message: "Payment could not be verified" });
        }

        const order = await orderModel.findByIdAndUpdate(
            orderId,
            { payment: true },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        return res.json({ success: true, message: "Paid" });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ success: false, message: "Payment could not be verified" });
    }
};

export { placeOrder, listOrders, userOrders, updateStatus, verifyOrder };