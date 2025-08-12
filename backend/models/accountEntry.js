import mongoose from 'mongoose';

const accountEntrySchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true,},
  date: {type: Date,required: true,},
  category: {type: String,required: true,default: 'Uncategorized',},
  amount: {type: Number,required: true,},
  description: {type: String,},
  sourceReceipt: {type: mongoose.Schema.Types.ObjectId,ref: 'Receipt',},
  tags: [String],
}, {
  timestamps: true,
});

const AccountEntry = mongoose.model('AccountEntry', accountEntrySchema);
export default AccountEntry;
