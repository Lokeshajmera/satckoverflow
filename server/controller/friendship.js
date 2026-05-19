import Friendship from "../models/friendship.js";

// SEND FRIEND REQUEST
export const sendFriendRequest = async (req, res) => {
  const { requester, recipient } = req.body;
  if (requester === recipient) {
    return res.status(400).json({ message: "Cannot send request to yourself" });
  }
  try {
    const existing = await Friendship.findOne({
      $or: [
        { requester, recipient },
        { requester: recipient, recipient: requester },
      ],
    });
    if (existing) {
      return res.status(400).json({ message: "Friend request already exists or you are already friends" });
    }
    const request = await Friendship.create({ requester, recipient });
    res.status(201).json({ data: request });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// RESPOND TO REQUEST (accept or reject)
export const respondToRequest = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'accept' or 'reject'
  try {
    if (action === "accept") {
      const updated = await Friendship.findByIdAndUpdate(
        id,
        { status: "accepted" },
        { new: true }
      );
      return res.status(200).json({ data: updated });
    } else if (action === "reject") {
      await Friendship.findByIdAndDelete(id);
      return res.status(200).json({ message: "Request rejected" });
    }
    res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET ACCEPTED FRIENDS FOR A USER
export const getFriends = async (req, res) => {
  const { userid } = req.params;
  try {
    const friendships = await Friendship.find({
      $or: [{ requester: userid }, { recipient: userid }],
      status: "accepted",
    });
    res.status(200).json({ data: friendships });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET PENDING INCOMING REQUESTS FOR A USER
export const getPendingRequests = async (req, res) => {
  const { userid } = req.params;
  try {
    const pending = await Friendship.find({ recipient: userid, status: "pending" });
    res.status(200).json({ data: pending });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET ALL FRIENDSHIPS INVOLVING A USER (for checking status with others)
export const getAllFriendships = async (req, res) => {
  const { userid } = req.params;
  try {
    const all = await Friendship.find({
      $or: [{ requester: userid }, { recipient: userid }],
    });
    res.status(200).json({ data: all });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
