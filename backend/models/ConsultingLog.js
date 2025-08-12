import mongoose from 'mongoose';

const consultingLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  inputData: {
    type: Object, // raw input sent to GPT (e.g., expenses summary)
    required: true,
  },
  gptResponse: {
    type: mongoose.Schema.Types.Mixed, // store as object or string
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  tokenUsage: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('ConsultingLog', consultingLogSchema);
