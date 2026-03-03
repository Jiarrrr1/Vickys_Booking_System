const Feedback = require('../models/Feedback.Model')
const generateId = require("../utils/generateId");

class FeedbackManagement {
    async createFeedback(payload){
        try {
            console.log('Creating feedback:', payload);
            
            const newId = await generateId()

            const newFeedback = new Feedback({
                feedBackId: newId,
                from: payload.name,
                rate: payload.rating || 0,
                comment: payload.message,
                status: payload.rating >= 4 ? 'positive' : (payload.rating <= 2 ? 'negative' : 'neutral'),
                isDisplay: false // Default to hidden until admin approves
            });

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

    // Get all feedback (for admin)
    async getAllFeedback() {
        try {
            const feedbacks = await Feedback.find().sort({ createdAt: -1 });
            return {
                success: true,
                data: feedbacks
            };
        } catch (error) {
            console.error('Error getting feedback:', error);
            throw error;
        }
    }

    // Get feedback by ID
    async getFeedbackById(id) {
        try {
            const feedback = await Feedback.findOne({ feedBackId: id }).exec();
            return {
                success: true,
                data: feedback
            };
        } catch (error) {
            console.error('Error getting feedback:', error);
            throw error;
        }
    }

    // Update feedback display status (show/hide on client)
    async updateFeedbackStatus(id, isDisplay) {
        try {
            const updatedFeedback = await Feedback.findOneAndUpdate(
                { feedBackId: id },
                { isDisplay: isDisplay },
                { new: true, runValidators: true }
            );

            return {
                success: true,
                message: `Feedback ${isDisplay ? 'shown' : 'hidden'} on client site`,
                data: updatedFeedback
            };
        } catch (error) {
            console.error('Error updating feedback status:', error);
            throw error;
        }
    }

    // Delete feedback
    async deleteFeedback(id) {
        try {
            await Feedback.findOneAndDelete({ feedBackId: id });
            return {
                success: true,
                message: "Feedback deleted successfully"
            };
        } catch (error) {
            console.error('Error deleting feedback:', error);
            throw error;
        }
    }

    // Get only approved feedback (for client side) - isDisplay = true
    async getApprovedFeedback() {
        try {
            const feedbacks = await Feedback.find({ isDisplay: true }).sort({ createdAt: -1 });
            return {
                success: true,
                data: feedbacks
            };
        } catch (error) {
            console.error('Error getting approved feedback:', error);
            throw error;
        }
    }
}

module.exports = new FeedbackManagement();