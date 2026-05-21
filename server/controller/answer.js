import mongoose from "mongoose";
import question from "../models/question.js";
import User from "../models/auth.js";

export const Askanswer = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  const { noofanswer, answerbody, useranswered, userid } = req.body;
  updatenoofanswer(_id, noofanswer);

  try {
    const updatequestion = await question.findByIdAndUpdate(_id, {
      $addToSet: { answer: [{ answerbody, useranswered, userid }] },
    });

    // Reward System: Add 5 points for answering
    await User.findByIdAndUpdate(userid, { $inc: { points: 5 } });

    res.status(200).json({ data: updatequestion });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

const updatenoofanswer = async (_id, noofanswer) => {
  try {
    await question.findByIdAndUpdate(_id, { $set: { noofanswer: noofanswer } });
  } catch (error) {
    console.log(error);
  }
};

export const deleteanswer = async (req, res) => {
  const { id: _id } = req.params;
  const { noofanswer, answerid } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  if (!mongoose.Types.ObjectId.isValid(answerid)) {
    return res.status(400).json({ message: "answer unavailable" });
  }

  updatenoofanswer(_id, noofanswer);
  try {
    const questionDoc = await question.findById(_id);
    const answerDoc = questionDoc.answer.id(answerid);

    if (answerDoc) {
      // Reward System: Deduct 5 points if answer is removed
      await User.findByIdAndUpdate(answerDoc.userid, { $inc: { points: -5 } });
    }

    const updatequestion = await question.updateOne(
      { _id },
      {
        $pull: { answer: { _id: answerid } },
      }
    );
    res.status(200).json({ data: updatequestion });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const voteAnswer = async (req, res) => {
  const { id: _id } = req.params;
  const { answerId, value, userid } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    return res.status(400).json({ message: "answer unavailable" });
  }

  try {
    const questionDoc = await question.findById(_id);
    const answerDoc = questionDoc.answer.id(answerId);

    if (!answerDoc) {
      return res.status(404).json({ message: "answer unavailable" });
    }

    const upindex = answerDoc.upvote.findIndex((id) => id === String(userid));
    const downindex = answerDoc.downvote.findIndex((id) => id === String(userid));

    let pointDelta = 0;
    const oldUpvotesCount = answerDoc.upvote.length;

    if (value === "upvote") {
      if (downindex !== -1) {
        answerDoc.downvote = answerDoc.downvote.filter((id) => id !== String(userid));
        pointDelta += 1; // Removing a downvote recovers 1 point
      }
      if (upindex === -1) {
        answerDoc.upvote.push(userid);
      } else {
        answerDoc.upvote = answerDoc.upvote.filter((id) => id !== String(userid));
      }
    } else if (value === "downvote") {
      if (upindex !== -1) {
        answerDoc.upvote = answerDoc.upvote.filter((id) => id !== String(userid));
      }
      if (downindex === -1) {
        answerDoc.downvote.push(userid);
        pointDelta -= 1; // Each downvote deducts 1 point
      } else {
        answerDoc.downvote = answerDoc.downvote.filter((id) => id !== String(userid));
        pointDelta += 1; // Removing a downvote recovers 1 point
      }
    }

    // Milestone bonus check: +5 points for 5th upvote
    const newUpvotesCount = answerDoc.upvote.length;
    if (oldUpvotesCount < 5 && newUpvotesCount === 5) {
      pointDelta += 5;
    } else if (oldUpvotesCount === 5 && newUpvotesCount < 5) {
      pointDelta -= 5; // Revert bonus if upvote count drops below 5
    }

    await questionDoc.save();

    if (pointDelta !== 0) {
      await User.findByIdAndUpdate(answerDoc.userid, { $inc: { points: pointDelta } });
    }

    res.status(200).json({ data: questionDoc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
