import path from 'path';
import Tesseract from 'tesseract.js';
import Receipt from '../models/Receipt.js';
import ConsultingLog from '../models/ConsultingLog.js';
import User from '../models/User.js';
import { openai } from '../utils/openai.js';
import { getMockConsultingResponse } from '../mocks/chatGPTMocks.js';
import AccountEntry from '../models/accountEntry.js'; // add this import at the top

export const uploadReceipt = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user.id;
    const user = await User.findById(req.user.id);
    const lang = user.languagePreference || "eng";

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // OCR processing
    const localImagePath = path.join(process.cwd(), req.file.path);
    const { data: { text } } = await Tesseract.recognize(localImagePath, lang);

    // Parse receipt items
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const parsedItems = [];
    const priceRegex = /(.+?)\s+(\d+[.,]\d{2})$/;

    lines.forEach(line => {
      const match = line.match(priceRegex);
      if (match) {
        parsedItems.push({
          name: match[1].trim(),
          amount: parseFloat(match[2])
        });
      }
    });

    let total = null;
    const totalRegex = /(TOTAL|AMOUNT|BALANCE DUE)\s+(\d+\.\d{2})/i;
    for (const line of lines) {
      const match = line.match(totalRegex);
      if (match) {
        total = parseFloat(match[2]);
        break;
      }
    }

    if (total === null) {
      return res.status(400).json({ message: 'Unable to detect total amount. Please upload a valid receipt.' });
    }

    // Use mock consulting response (replace with real OpenAI if available)
    const consultingResult = getMockConsultingResponse({ extractedText: text });

    // Save consulting log
    const consultingLog = new ConsultingLog({
      user: userId,
      inputData: { receiptText: text },
      gptResponse: consultingResult.advice,
    });
    await consultingLog.save();

    // Save receipt
    const newReceipt = new Receipt({
      user: userId,
      originalImageUrl: `/uploads/${file.filename}`,
      extractedText: text,
      items: parsedItems,
      total,
    });
    await newReceipt.save();

    // Create AccountEntry docs for each item
    const accountEntries = parsedItems.map(item => ({
      user: userId,
      date: newReceipt.date || new Date(), // fallback to now if no date on receipt
      category: item.category || 'Uncategorized', // category field in parsed items (optional)
      amount: item.amount,
      description: item.name,
      sourceReceipt: newReceipt._id,
    }));

    await AccountEntry.insertMany(accountEntries);

    res.status(201).json({
      message: "Receipt uploaded, consulting completed (mock response), and account entries created",
      receipt: newReceipt,
      consulting: consultingResult.advice,
    });
  } catch (error) {
    if (error.code === 'insufficient_quota') {
      return res.status(403).json({ message: 'OpenAI quota exceeded. Please check billing.' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};



export const getReceipt= async (req, res) => {
  try {
    const userId = req.user.id;
    const receipts = await Receipt.find({ user: userId }).sort({ createdAt: -1 });
    res.json({receipts});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch receipts' });
  }
}

export const getAdvice= async (req, res) => {
  const receipt = await Receipt.findOne({ 
    _id: req.params.id, 
    user: req.user.id 
  });

  if (!receipt) {
    return res.status(404).json({ message: 'Receipt not found' });
  }

  // Mock ChatGPT-like advice
  const mockAdvice = `Based on your purchase of ${receipt.items.length} items totaling $${receipt.total}, 
  you might want to consider budgeting strategies for the next month.`;

  res.json({ advice: mockAdvice });
}