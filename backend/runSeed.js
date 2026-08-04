import dotenv from "dotenv";
dotenv.config({ path: "./backend/.env" });
import { connectDB } from "./config/db.js";
import { seedDatabase } from "./config/seedData.js";

async function run() {
    await connectDB();
    await seedDatabase();
    process.exit(0);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
