import express from "express";
import {
  createPost,
  getAllPosts,
  likePost,
  commentPost,
  sharePost,
  deletePost,
  likeComment,
  replyComment,
} from "../controller/post.js";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Media upload endpoint - returns Cloudinary URL
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const isVideo = req.file.mimetype.startsWith("video/");
    res.status(200).json({
      url: req.file.path,
      mediaType: isVideo ? "video" : "image",
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
});

router.post("/create", auth, createPost);
router.get("/getall", getAllPosts);
router.patch("/like/:id", auth, likePost);
router.post("/comment/:id", auth, commentPost);
router.patch("/share/:id", auth, sharePost);
router.delete("/delete/:id", auth, deletePost);
router.patch("/comment/like/:postId/:commentId", auth, likeComment);
router.post("/comment/reply/:postId/:commentId", auth, replyComment);

export default router;
