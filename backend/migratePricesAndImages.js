import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env
import { connectDB } from "./config/db.js";
import foodModel from "./models/foodModel.js";

const newFoodMapping = {
    "Greek salad": { price: 120, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80" },
    "Veg salad": { price: 180, image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80" },
    "Clover Salad": { price: 160, image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=600&q=80" },
    "Chicken Salad": { price: 240, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80" },
    "Lasagna Rolls": { price: 140, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80" },
    "Peri Peri Rolls": { price: 120, image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=600&q=80" },
    "Chicken Rolls": { price: 200, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80" },
    "Veg Rolls": { price: 150, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80" },
    "Ripple Ice Cream": { price: 140, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80" },
    "Fruit Ice Cream": { price: 220, image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80" },
    "Jar Ice Cream": { price: 100, image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80" },
    "Vanilla Ice Cream": { price: 120, image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80" },
    "Chicken Sandwich": { price: 120, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80" },
    "Vegan Sandwich": { price: 180, image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80" },
    "Grilled Sandwich": { price: 160, image: "https://images.unsplash.com/photo-1538220856186-0be0c0c5b74a?auto=format&fit=crop&w=600&q=80" },
    "Bread Sandwich": { price: 240, image: "https://images.unsplash.com/photo-1475090169767-40ed8d18a67d?auto=format&fit=crop&w=600&q=80" },
    "Cup Cake": { price: 140, image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=600&q=80" },
    "Vegan Cake": { price: 120, image: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=600&q=80" },
    "Butterscotch Cake": { price: 200, image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f8011b?auto=format&fit=crop&w=600&q=80" },
    "Sliced Cake": { price: 150, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80" },
    "Garlic Mushroom": { price: 140, image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80" },
    "Fried Cauliflower": { price: 220, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80" },
    "Mix Veg Pulao": { price: 100, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80" },
    "Rice Zucchini": { price: 120, image: "https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=600&q=80" },
    "Cheese Pasta": { price: 120, image: "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?auto=format&fit=crop&w=600&q=80" },
    "Tomato Pasta": { price: 180, image: "https://images.unsplash.com/photo-1563379971899-660589a01cf3?auto=format&fit=crop&w=600&q=80" },
    "Creamy Pasta": { price: 160, image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80" },
    "Chicken Pasta": { price: 240, image: "https://images.unsplash.com/photo-1621961424411-4822fdb9e8f8?auto=format&fit=crop&w=600&q=80" },
    "Butter Noodles": { price: 140, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80" },
    "Veg Noodles": { price: 120, image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80" },
    "Somen Noodles": { price: 200, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80" },
    "Cooked Noodles": { price: 150, image: "https://images.unsplash.com/photo-1558985250-27a406d64cb3?auto=format&fit=crop&w=600&q=80" }
};

async function migrate() {
    await connectDB();
    const foods = await foodModel.find();
    console.log(`Found ${foods.length} food items in DB.`);

    let updatedCount = 0;
    for (let food of foods) {
        let needsUpdate = false;
        
        // Update standard seed items
        if (newFoodMapping[food.name]) {
            const target = newFoodMapping[food.name];
            if (food.price !== target.price) {
                food.price = target.price;
                needsUpdate = true;
            }
            if (food.image !== target.image) {
                food.image = target.image;
                needsUpdate = true;
            }
        } else {
            // For custom items: multiply price by 10 if it's less than 100
            if (food.price < 100) {
                food.price = food.price * 10;
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            await food.save();
            updatedCount++;
            console.log(`Updated food: ${food.name} -> price: ${food.price}, image: ${food.image}`);
        }
    }

    console.log(`Migration complete. Updated ${updatedCount} food items.`);
    process.exit(0);
}

migrate().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
