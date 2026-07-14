import { askAI } from "../services/aiService.js";

export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const response = await askAI(message);

        return res.status(200).json({
            success: true,
            reply: response
        });

    } catch (error) {
        console.error("AI Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export default chatWithAI;