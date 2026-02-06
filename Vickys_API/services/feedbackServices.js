const Feedback = require('../models/Feedback.Model')
const generateId = require("../utils/generateId");
const getStatusValue = require('../utils/getStatusValue')

class FeedbackManagement {
    async createFeedback(payload){
        try {

            console.log(payload);
            
            const newId = await generateId()
            const newStatus = await getStatusValue(payload.rate)

            const newFeedback = new Feedback({
                feedBackId: newId,
                from: payload.fullName,
                rate: payload.rate,
                comment: payload.comment,
                status: newStatus,
            })

            await newFeedback.save();

            return {
                success: true,
                message: "Feedback Submitted Successfully.",
                data: newFeedback,
            };
        }
        catch(error){
            console.error('Error creating feedback:', error);
            throw error;
        }
    }
}

module.exports = new FeedbackManagement();