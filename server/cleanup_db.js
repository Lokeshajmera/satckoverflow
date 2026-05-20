import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const clean = async () => {
    try {
        const dbUrl = process.env.MONGODB_URL;
        if (!dbUrl) {
            console.error("MONGODB_URL not found in .env");
            process.exit(1);
        }

        console.log("Connecting to Database...");
        await mongoose.connect(dbUrl);
        console.log("Connected.");

        // List of collections to wipe
        const collections = ['users', 'posts', 'friendships', 'questions', 'answers'];

        for (const colName of collections) {
            try {
                await mongoose.connection.db.collection(colName).deleteMany({});
                console.log(`✅ Cleared: ${colName}`);
            } catch (e) {
                console.log(`⚠️ Skip: ${colName} (Probably doesn't exist yet)`);
            }
        }

        console.log("\n✨ Database cleared successfully! You can now start with a fresh state.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Cleanup failed:", err);
        process.exit(1);
    }
};

clean();
