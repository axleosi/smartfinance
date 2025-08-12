import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['user','partner','admin'], default: 'user' },

  promoCode: { type: String, unique: true, sparse: true }, // 'QQ12'
  promoLink: { type: String }, // 'https://a.com/QQ12'

  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  languagePreference: { type: String, default: 'eng' },
  createdAt: { type: Date, default: Date.now },
  suspended:{ type: Boolean, default: false }
});

const User= mongoose.model('User', userSchema);
export default User
