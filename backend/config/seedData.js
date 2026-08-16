import mongoose from "mongoose";
import "dotenv/config";
import foodModel from "../models/foodModel.js";

const initialFoods = [
    { name: "Greek salad", price: 120, description: "Fresh medley of crisp cucumbers, ripe tomatoes, red onions, olives, and premium feta cheese.", category: "Salad", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80" },
    { name: "Veg salad", price: 180, description: "Vibrant garden salad packed with organic greens and a light zesty vinaigrette.", category: "Salad", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80" },
    { name: "Clover Salad", price: 160, description: "Nutritious power bowl loaded with super greens, seeds, and healthy dressing.", category: "Salad", image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=600&q=80" },
    { name: "Chicken Salad", price: 240, description: "Tender grilled chicken breast served over a bed of fresh mixed greens and herbs.", category: "Salad", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80" },
    { name: "Lasagna Rolls", price: 140, description: "Italian classic rolled pasta filled with rich ricotta, spinach, and savory marinara.", category: "Rolls", image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80" },
    { name: "Peri Peri Rolls", price: 120, description: "Spicy and tangy peri-peri grilled filling wrapped in a warm soft flatbread.", category: "Rolls", image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=600&q=80" },
    { name: "Chicken Rolls", price: 200, description: "Succulent shredded chicken roll-up toasted to perfection with mild spices.", category: "Rolls", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80" },
    { name: "Veg Rolls", price: 150, description: "Crispy sautéed vegetables with house sauces rolled in a golden tortilla.", category: "Rolls", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80" },
    { name: "Ripple Ice Cream", price: 140, description: "Velvety ice cream marbled with premium fruit compote waves.", category: "Deserts", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80" },
    { name: "Fruit Ice Cream", price: 220, description: "Creamy artisanal gelato loaded with chunks of fresh seasonal orchard fruits.", category: "Deserts", image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80" },
    { name: "Jar Ice Cream", price: 100, description: "Layered gourmet sundae served in a reusable mason jar.", category: "Deserts", image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80" },
    { name: "Vanilla Ice Cream", price: 120, description: "Classic Madagascar vanilla bean ice cream, smooth and incredibly rich.", category: "Deserts", image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80" },
    { name: "Chicken Sandwich", price: 120, description: "Toasted artisanal sourdough sandwich with juicy herb-marinated chicken breast.", category: "Sandwich", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80" },
    { name: "Vegan Sandwich", price: 180, description: "Plant-based avocado, spinach, and vine-ripened tomato sandwich on multi-grain bread.", category: "Sandwich", image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80" },
    { name: "Grilled Sandwich", price: 160, description: "Golden panini layered with melted cheese, bell peppers, and signature pesto.", category: "Sandwich", image: "https://images.unsplash.com/photo-1538220856186-0be0c0c5b74a?auto=format&fit=crop&w=600&q=80" },
    { name: "Bread Sandwich", price: 240, description: "Hearty double-decker sandwich loaded with farm-fresh fillings.", category: "Sandwich", image: "https://images.unsplash.com/photo-1475090169767-40ed8d18a67d?auto=format&fit=crop&w=600&q=80" },
    { name: "Cup Cake", price: 140, description: "Soft sponge cake frosted with light and fluffy signature buttercream.", category: "Cake", image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=600&q=80" },
    { name: "Vegan Cake", price: 120, description: "Decadent dairy-free chocolate fudge cake topped with organic cacao glaze.", category: "Cake", image: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=600&q=80" },
    { name: "Butterscotch Cake", price: 200, description: "Rich butterscotch sponge cake with butterscotch chips and caramel drizzle.", category: "Cake", image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f8011b?auto=format&fit=crop&w=600&q=80" },
    { name: "Sliced Cake", price: 150, description: "Perfect individual slice of premium black forest gateau.", category: "Cake", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80" },
    { name: "Garlic Mushroom", price: 140, description: "Sautéed button mushrooms in a rich, buttery garlic and parsley reduction.", category: "Pure Veg", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80" },
    { name: "Fried Cauliflower", price: 220, description: "Crispy, golden florets seasoned with mild spices and herbs.", category: "Pure Veg", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80" },
    { name: "Mix Veg Pulao", price: 100, description: "Fragrant basmati rice cooked with fresh seasonal vegetables and aromatic whole spices.", category: "Pure Veg", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80" },
    { name: "Rice Zucchini", price: 120, description: "Light and healthy rice preparation with sautéed zucchini and a hint of lemon.", category: "Pure Veg", image: "https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=600&q=80" },
    { name: "Cheese Pasta", price: 120, description: "Penne pasta tossed in a rich, creamy cheese sauce with parsley garnish.", category: "Pasta", image: "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?auto=format&fit=crop&w=600&q=80" },
    { name: "Tomato Pasta", price: 180, description: "Tangy tomato and basil marinara sauce with al dente pasta.", category: "Pasta", image: "https://images.unsplash.com/photo-1563379971899-660589a01cf3?auto=format&fit=crop&w=600&q=80" },
    { name: "Creamy Pasta", price: 160, description: "Silky white sauce pasta loaded with sautéed mushrooms and mixed herbs.", category: "Pasta", image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80" },
    { name: "Chicken Pasta", price: 240, description: "Sautéed chicken and pasta cooked in a robust house pink sauce.", category: "Pasta", image: "https://images.unsplash.com/photo-1621961424411-4822fdb9e8f8?auto=format&fit=crop&w=600&q=80" },
    { name: "Butter Noodles", price: 140, description: "Comforting butter-glazed noodles with spring onions and sesame.", category: "Noodles", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80" },
    { name: "Veg Noodles", price: 120, description: "Stir-fried noodles with crisp vegetables and a splash of soy sauce.", category: "Noodles", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80" },
    { name: "Somen Noodles", price: 200, description: "Delicate Japanese wheat noodles served with a mild savory dipping broth.", category: "Noodles", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80" },
    { name: "Cooked Noodles", price: 150, description: "Perfect stir-fried noodles cooked in rich, savory sauces.", category: "Noodles", image: "https://images.unsplash.com/photo-1558985250-27a406d64cb3?auto=format&fit=crop&w=600&q=80" }
];

export const seedDatabase = async () => {
    try {
        const count = await foodModel.countDocuments();
        if (count === 0) {
            console.log("Seeding database with default 32 menu items...");
            await foodModel.insertMany(initialFoods);
            console.log("Successfully seeded 32 food items!");
        } else {
            console.log(`Database already has ${count} food items. Skipping initial seed.`);
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }
};
