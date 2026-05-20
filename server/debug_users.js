import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const debug = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log("Users in DB:", JSON.stringify(users.map(u => ({ _id: u._id, name: u.name })), null, 2));
    process.exit(0);
};
debug();
