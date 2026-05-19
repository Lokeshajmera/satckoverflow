import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
  userid: { type: String, required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const shareSchema = mongoose.Schema({
  userid: { type: String, required: true },
  username: { type: String, required: true },
  sharedAt: { type: Date, default: Date.now },
});

const postSchema = mongoose.Schema({
  userid: { type: String, required: true },
  username: { type: String, required: true },
  content: { type: String, default: "" },
  mediaUrl: { type: String, default: "" },
  mediaType: { type: String, enum: ["image", "video", "none"], default: "none" },
  likes: { type: [String], default: [] }, // array of userids
  comments: { type: [commentSchema], default: [] },
  shares: { type: [shareSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Post", postSchema);
