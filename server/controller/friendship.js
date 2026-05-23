import Friendship from "../models/friendship.js";
import User from "../models/auth.js";

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

    const userIds = friendships.map(f => f.requester === userid ? f.recipient : f.requester);
    const users = await User.find({ _id: { $in: userIds } }, "name about");
    const userMap = users.reduce((map, u) => {
      map[u._id.toString()] = u;
      return map;
    }, {});

    const data = friendships.map(f => {
      const friendId = f.requester === userid ? f.recipient : f.requester;
      const u = userMap[friendId];
      return {
        ...f.toObject(),
        friendName: u ? u.name : "Unknown User",
        friendAbout: u ? u.about : "",
      };
    });

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET PENDING INCOMING REQUESTS FOR A USER
export const getPendingRequests = async (req, res) => {
  const { userid } = req.params;
  try {
    const pending = await Friendship.find({ recipient: userid, status: "pending" });

    const requesterIds = pending.map(f => f.requester);
    const users = await User.find({ _id: { $in: requesterIds } }, "name about");
    const userMap = users.reduce((map, u) => {
      map[u._id.toString()] = u;
      return map;
    }, {});

    const data = pending.map(f => {
      const u = userMap[f.requester];
      return {
        ...f.toObject(),
        requesterName: u ? u.name : "Unknown User",
        requesterAbout: u ? u.about : "",
      };
    });

    res.status(200).json({ data });
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

    const userIds = [];
    all.forEach(f => {
      if (f.requester !== userid) userIds.push(f.requester);
      if (f.recipient !== userid) userIds.push(f.recipient);
    });

    const users = await User.find({ _id: { $in: userIds } }, "name about");
    const userMap = users.reduce((map, u) => {
      map[u._id.toString()] = u;
      return map;
    }, {});

    const data = all.map(f => {
      const requesterUser = userMap[f.requester];
      const recipientUser = userMap[f.recipient];
      return {
        ...f.toObject(),
        requesterName: requesterUser ? requesterUser.name : "Unknown User",
        recipientName: recipientUser ? recipientUser.name : "Unknown User",
      };
    });

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
