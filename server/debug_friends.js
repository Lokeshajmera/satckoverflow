import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const debug = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    const friendships = await mongoose.connection.db.collection('friendships').find({}).toArray();
    console.log("Friendships in DB:", JSON.stringify(friendships, null, 2));
    process.exit(0);
};
debug();
