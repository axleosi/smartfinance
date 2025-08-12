import mongoose from "mongoose";

const shareLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['facebook','twitter','kakao'], required: true },
  promoCode: String,
  promoLink: String,
  verified: { type: Boolean, default: false },
  verifiedAt: Date,
  createdAt: { type: Date, default: Date.now },
  meta: Object
});

export default mongoose.models.ShareLog || mongoose.model("ShareLog", shareLogSchema);
