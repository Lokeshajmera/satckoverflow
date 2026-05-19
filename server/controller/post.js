import Post from "../models/post.js";
import Friendship from "../models/friendship.js";

// Helper: get accepted friend count for a user
const getFriendCount = async (userid) => {
  const count = await Friendship.countDocuments({
    $or: [{ requester: userid }, { recipient: userid }],
    status: "accepted",
  });
  return count;
};

// Helper: get today's post count for a user
const getTodayPostCount = async (userid) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const count = await Post.countDocuments({
    userid,
    createdAt: { $gte: startOfDay },
  });
  return count;
};

// Helper: get daily post limit based on friend count
// 0 friends → 0, 1-10 friends → equal to friend count, >10 → unlimited
const getDailyLimit = (friendCount) => {
  if (friendCount === 0) return 0;
  if (friendCount <= 10) return friendCount;
  return Infinity;
};

// CREATE POST
export const createPost = async (req, res) => {
  const { userid, username, content, mediaUrl, mediaType } = req.body;
  if (!userid || !username) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const friendCount = await getFriendCount(userid);
    const limit = getDailyLimit(friendCount);

    if (limit === 0) {
      return res.status(403).json({
        message: "You need at least 1 friend to post. Connect with someone first!",
      });
    }

    if (limit !== Infinity) {
      const todayCount = await getTodayPostCount(userid);
      if (todayCount >= limit) {
        return res.status(403).json({
          message: `You can only post ${limit} time(s) per day with ${friendCount} friend(s). Add more friends to post more!`,
        });
      }
    }

    if (!content && !mediaUrl) {
      return res.status(400).json({ message: "Post must have content or media." });
    }

    const newPost = await Post.create({
      userid,
      username,
      content: content || "",
      mediaUrl: mediaUrl || "",
      mediaType: mediaType || "none",
    });

    res.status(201).json({ data: newPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET ALL POSTS
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json({ data: posts });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// LIKE / UNLIKE POST
export const likePost = async (req, res) => {
  const { id } = req.params;
  const { userid } = req.body;
  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(userid)) {
      post.likes = post.likes.filter((uid) => uid !== userid);
    } else {
      post.likes.push(userid);
    }
    await post.save();
    res.status(200).json({ data: post });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ADD COMMENT
export const commentPost = async (req, res) => {
  const { id } = req.params;
  const { userid, username, text } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }
  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ userid, username, text });
    await post.save();
    res.status(200).json({ data: post });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// SHARE POST
export const sharePost = async (req, res) => {
  const { id } = req.params;
  const { userid, username } = req.body;
  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyShared = post.shares.find((s) => s.userid === userid);
    if (alreadyShared) {
      return res.status(400).json({ message: "You have already shared this post" });
    }

    post.shares.push({ userid, username });
    await post.save();
    res.status(200).json({ data: post });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// DELETE POST
export const deletePost = async (req, res) => {
  const { id } = req.params;
  const { userid } = req.body;
  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userid !== userid) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }
    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
