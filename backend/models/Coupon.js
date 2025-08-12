import mongoose from "mongoose";


const couponSchema = new mongoose.Schema({
  code: String,
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  issuedAt: Date,
  redeemed: { type: Boolean, default: false },
});

export default mongoose.models.Coupons || mongoose.model('Coupons', couponSchema);