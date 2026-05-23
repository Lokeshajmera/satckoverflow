import mongoose from "mongoose";
import question from "../models/question.js";
import User from "../models/auth.js";

const getPlanLimit = (plan) => {
  switch (plan) {
    case "Bronze": return 5;
    case "Silver": return 10;
    case "Gold": return Infinity;
    default: return 1; // Free Plan
  }
};


export const Askquestion = async (req, res) => {
  const { postquestiondata } = req.body;
  const userid = req.userid;

  try {
    const userDoc = await User.findById(userid);
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    // Character limits validation (letters including spaces)
    if ((postquestiondata.questiontitle || "").length > 200) {
      return res.status(400).json({ message: "Question title must not exceed 200 characters." });
    }

    if ((postquestiondata.questionbody || "").length > 500) {
      return res.status(400).json({ message: "Question details must not exceed 500 characters." });
    }

    // Tags count validation
    if (!postquestiondata.questiontags || !Array.isArray(postquestiondata.questiontags) || postquestiondata.questiontags.length < 1) {
      return res.status(400).json({ message: "At least one tag is required." });
    }
    if (postquestiondata.questiontags.length > 5) {
      return res.status(400).json({ message: "You can add up to 5 tags." });
    }

    const today = new Date().toISOString().split("T")[0];
    const planLimit = getPlanLimit(userDoc.plan);

    // Check if stats are for a different day, then reset
    if (userDoc.dailyQuestionStats.date !== today) {
      userDoc.dailyQuestionStats = { date: today, count: 0 };
    }

    if (userDoc.dailyQuestionStats.count >= planLimit) {
      return res.status(403).json({
        message: `Daily post limit reached for ${userDoc.plan} plan (${planLimit} posts). Please upgrade your plan for more postings.`
      });
    }

    const postques = new question({ ...postquestiondata, userid: userid });
    await postques.save();

    // Increment count
    userDoc.dailyQuestionStats.count += 1;
    await userDoc.save();

    res.status(200).json({ data: postques });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong.." });
  }
};

export const getallquestion = async (req, res) => {
  try {
    const allquestion = await question.find().sort({ askedon: -1 });
    res.status(200).json({ data: allquestion });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const deletequestion = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    await question.findByIdAndDelete(_id);
    res.status(200).json({ message: "question deleted" });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const votequestion = async (req, res) => {
  const { id: _id } = req.params;
  const { value, userid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    const questionDoc = await question.findById(_id);
    const upindex = questionDoc.upvote.findIndex((id) => id === String(userid));
    const downindex = questionDoc.downvote.findIndex(
      (id) => id === String(userid)
    );
    if (value === "upvote") {
      if (downindex !== -1) {
        questionDoc.downvote = questionDoc.downvote.filter(
          (id) => id !== String(userid)
        );
      }
      if (upindex === -1) {
        questionDoc.upvote.push(userid);
      } else {
        questionDoc.upvote = questionDoc.upvote.filter((id) => id !== String(userid));
      }
    } else if (value === "downvote") {
      if (upindex !== -1) {
        questionDoc.upvote = questionDoc.upvote.filter((id) => id !== String(userid));
      }
      if (downindex === -1) {
        questionDoc.downvote.push(userid);
      } else {
        questionDoc.downvote = questionDoc.downvote.filter(
          (id) => id !== String(userid)
        );
      }
    }
    const questionvote = await question.findByIdAndUpdate(_id, questionDoc, { new: true });
    res.status(200).json({ data: questionvote });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
