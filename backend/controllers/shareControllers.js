import ShareLog from "../models/sharedReferrals.js";

export const logShare = async (req, res) => {
  try {
    const { platform } = req.body;

    if (!platform) {
      return res.status(400).json({ message: "Platform is required" });
    }

    const userId = req.user?._id; // assuming auth middleware sets req.user
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await ShareLog.create({ userId, platform });

    res.status(200).json({ message: "Share logged successfully" });
  } catch (err) {
    console.error("Error logging share:", err);
    res.status(500).json({ message: "Server error" });
  }
};
