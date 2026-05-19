import express from "express";
import {
  sendFriendRequest,
  respondToRequest,
  getFriends,
  getPendingRequests,
  getAllFriendships,
} from "../controller/friendship.js";

const router = express.Router();

router.post("/request", sendFriendRequest);
router.patch("/respond/:id", respondToRequest);
router.get("/friends/:userid", getFriends);
router.get("/pending/:userid", getPendingRequests);
router.get("/all/:userid", getAllFriendships);

export default router;
