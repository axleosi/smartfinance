import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalImageUrl: { type: String, required: true },
  extractedText: { type: String, required: true },
  items: [
    {
      name: String,
      amount: Number,
      category: String,   // e.g., "Groceries", "Transport"
    }
  ],
  total: { type: Number, required: true },
  subtotal: { type: Number },
  totalTax: { type: Number },
  currency: { type: String, default: 'USD' },
  storeName: { type: String },
  paymentMethod: { type: String }, // e.g., Cash, Credit Card
  date: { type: Date, default: Date.now },
  tags: [String],   // user-added tags for categorization
}, { timestamps: true });

const Receipt= mongoose.model('Receipt', receiptSchema);
export default Receipt