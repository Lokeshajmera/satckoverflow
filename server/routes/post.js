import express from "express";
import {
  createPost,
  getAllPosts,
  likePost,
  commentPost,
  sharePost,
  deletePost,
} from "../controller/post.js";

const router = express.Router();

router.post("/create", createPost);
router.get("/getall", getAllPosts);
router.patch("/like/:id", likePost);
router.post("/comment/:id", commentPost);
router.patch("/share/:id", sharePost);
router.delete("/delete/:id", deletePost);

export default router;
