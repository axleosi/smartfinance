import express from "express";
import User from "../models/User.js";
import { authenticateJWT } from "../middleware/auth.js"; // JWT auth middleware

const router = express.Router();

// Update language preference
router.put("/language", authenticateJWT, async (req, res) => {
  try {
    const { language } = req.body;
    if (!language) return res.status(400).json({ message: "Language is required" });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { languagePreference: language },
      { new: true }
    );

    res.json({ message: "Language updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
