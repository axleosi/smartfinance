import ConsultingLog from '../models/ConsultingLog.js';

export const createConsultingLog = async (req, res) => {
  try {
    const { inputData, gptResponse } = req.body;
    const userId = req.user._id;

    if (!inputData || !gptResponse) {
      return res.status(400).json({ message: 'Missing input or response' });
    }

    const log = new ConsultingLog({
      user: userId,
      inputData,
      gptResponse,
    });

    await log.save();

    res.status(201).json({ message: 'Consulting log saved', log });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getConsultingLogs = async (req, res) => {
  try {
    const userId = req.user._id;

    const logs = await ConsultingLog.find({ user: userId }).sort({ createdAt: -1 });

    res.json({ logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
