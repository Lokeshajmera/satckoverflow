import express from "express";
import {
  createPost,
  getAllPosts,
  likePost,
  commentPost,
  sharePost,
  deletePost,
} from "../controller/post.js";
import upload from "../middleware/upload.js";

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

router.post("/create", createPost);
router.get("/getall", getAllPosts);
router.patch("/like/:id", likePost);
router.post("/comment/:id", commentPost);
router.patch("/share/:id", sharePost);
router.delete("/delete/:id", deletePost);

export default router;

