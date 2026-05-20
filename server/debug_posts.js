import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const debug = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    const posts = await mongoose.connection.db.collection('posts').find({}).toArray();
    console.log("Posts in DB:", JSON.stringify(posts, null, 2));
    process.exit(0);
};
debug();
