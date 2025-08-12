import Winner from "../models/Winner.js";
import User from "../models/User.js";

const checkWinnings = async(req, res) => {
    const winningStockDecimal = 123;
    const winningReceiptNumber = 378;
    const { stockDecimal, receiptNumber } = req.body;

    console.log(stockDecimal);
    

    try {
        if (!stockDecimal || !receiptNumber) {
            return res.status(400).json({ message: 'Please input your receipt number and stock decimal' });
        }

        const userStockDecimal = parseInt(stockDecimal, 10);
        const userReceiptNumber = parseInt(receiptNumber, 10);

        if (userStockDecimal === winningStockDecimal && userReceiptNumber === winningReceiptNumber) {
            const userDoc = await User.findById(req.user.id);
            await Winner.create({
                userId: userDoc._id, // from auth middleware
                name: userDoc.name,
                stockDecimal: userStockDecimal,
                receiptNumber: userReceiptNumber,
                date: new Date()
            });

            return res.status(200).json({ message: "You've won. Congratulations!" });
        }

        return res.status(200).json({ message: "You didn't win. Good luck next time." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong on the server.' });
    }
};
export default checkWinnings