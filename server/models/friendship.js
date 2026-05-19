import mongoose from "mongoose";

const friendshipSchema = mongoose.Schema({
  requester: { type: String, required: true }, // userid of the person who sent the request
  recipient: { type: String, required: true }, // userid of the person who received it
  status: {
    type: String,
    enum: ["pending", "accepted"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Friendship", friendshipSchema);
