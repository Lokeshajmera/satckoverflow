import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const repair = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB.");
        
        // Find users with empty, blank or missing name
        const db = mongoose.connection.db;
        const users = await db.collection('users').find({
            $or: [
                { name: { $exists: false } },
                { name: null },
                { name: "" },
                { name: /^\s*$/ }
            ]
        }).toArray();
        
        console.log(`Found ${users.length} users with invalid/missing names.`);
        
        for (const user of users) {
            // Determine a fallback name
            let fallbackName = "User_" + user._id.toString().substring(18);
            if (user.email) {
                const prefix = user.email.split("@")[0];
                if (prefix) {
                    fallbackName = prefix;
                }
            }
            console.log(`Repairing user ${user._id}: setting name to "${fallbackName}" (previous name: "${user.name || ""}")`);
            
            await db.collection('users').updateOne(
                { _id: user._id },
                { $set: { name: fallbackName } }
            );
        }
        
        console.log("Database repair complete.");
        process.exit(0);
    } catch (error) {
        console.error("Error repairing database:", error);
        process.exit(1);
    }
};

repair();
