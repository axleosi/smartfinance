import mongoose from 'mongoose'

const winnerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    stockDecimal: Number,
    receiptNumber: Number,
    date: { type: Date, default: Date.now }
});

const Winner = mongoose.model('Winner', winnerSchema);
export default Winner
