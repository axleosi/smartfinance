import mongoose from "mongoose";

const visitLogSchema = new mongoose.Schema({
  visitorId: { type: String, required: true }, // could be a UUID or hashed IP
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.VisitLog || mongoose.model("VisitLog", visitLogSchema);
