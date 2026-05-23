import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const clearDB = async () => {
    try {
        if (!process.env.MONGODB_URL) {
            console.error("MONGODB_URL is not defined in environment variables!");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB.");

        const db = mongoose.connection.db;
        
        // List of collections to clear
        const collections = ['users', 'questions', 'posts', 'friendships'];
        
        for (const colName of collections) {
            const count = await db.collection(colName).countDocuments();
            console.log(`Clearing ${count} documents from collection: "${colName}"...`);
            await db.collection(colName).deleteMany({});
            console.log(`Collection "${colName}" cleared successfully.`);
        }

        console.log("\nDatabase successfully cleared! All users, questions, posts, and friendships have been deleted.");
        process.exit(0);
    } catch (error) {
        console.error("Error clearing database:", error);
        process.exit(1);
    }
};

clearDB();
