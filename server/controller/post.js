import Post from "../models/post.js";
import Friendship from "../models/friendship.js";
import User from "../models/auth.js";

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
    return res.status(401).json({ message: "Login expired. Please login again." });
  }

  try {
    const friendCount = await getFriendCount(userid);
    const limit = getDailyLimit(friendCount);

    console.log(`[DEBUG] CreatePost - User: ${username}, Friends: ${friendCount}, Limit: ${limit}`);

    if (limit === 0) {
      return res.status(403).json({
        message: "Add at least 1 friend to start sharing posts!",
      });
    }

    if (limit !== Infinity) {
      const todayCount = await getTodayPostCount(userid);
      console.log(`[DEBUG] CreatePost - Today's Count: ${todayCount}`);

      if (todayCount >= limit) {
        const errorMsg = `Post limit reached! You have ${friendCount} friend(s), allowing ${limit} post(s) per day. Add more friends to post more!`;
        return res.status(403).json({ message: errorMsg });
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

    post.shares.push({ userid, username });
    await post.save();
    res.status(200).json({ data: post });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// LIKE / UNLIKE COMMENT
export const likeComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userid } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.likes.includes(userid)) {
      comment.likes = comment.likes.filter((uid) => uid !== userid);
    } else {
      comment.likes.push(userid);
    }

    await post.save();
    res.status(200).json({ data: post });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// REPLY TO COMMENT
export const replyComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userid, username, text } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies = comment.replies || [];

    let finalUsername = username;
    if (!finalUsername) {
      const userDoc = await User.findById(userid);
      finalUsername = userDoc?.name || "Member";
    }

    comment.replies.push({ userid, username: finalUsername, text });
    await post.save();
    res.status(200).json({ data: post });
  } catch (error) {
    console.error("Reply Comment Error:", error);
    res.status(500).json({ message: error.message || "Something went wrong" });
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
