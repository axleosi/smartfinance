import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // assuming partners are users with role 'partner'
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  paymentMethod: {
    type: String, // e.g. 'stripe', 'paypal', 'toss', 'credit_card'
    required: true,
  },
  paymentType: {
    type: String,
    enum: ['subscription', 'one-time', 'refund', 'coupon'],
    default: 'one-time',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  subscriptionPeriod: {
    startDate: Date,
    endDate: Date,
  },
  couponCode: {
    type: String,
  },
  transactionId: {
    type: String, // ID from payment gateway
    unique: true,
    required: true,
  },
  refundReason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
