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
        console.log('==========================================');
        console.log('📝 SERVICE: updateFeedbackStatus called');
        console.log('   ID received:', id);
        console.log('   ID type:', typeof id);
        console.log('   isDisplay received:', isDisplay);
        console.log('   isDisplay type:', typeof isDisplay);
        
        // Step 1: Check if feedback exists BEFORE update
        const beforeUpdate = await Feedback.findOne({ feedBackId: id });
        
        if (!beforeUpdate) {
            console.log('❌ Feedback NOT FOUND with feedBackId:', id);
            console.log('   Searching in database...');
            
            // Debug: Show all feedBackIds in database
            const allFeedbacks = await Feedback.find({}, { feedBackId: 1 }).limit(10);
            console.log('   First 10 feedBackIds in DB:', allFeedbacks.map(f => f.feedBackId));
            
            throw new Error(`Feedback with feedBackId ${id} not found`);
        }
        
        console.log('✅ Found feedback BEFORE update:');
        console.log('   feedBackId:', beforeUpdate.feedBackId);
        console.log('   Current isDisplay:', beforeUpdate.isDisplay);
        console.log('   from:', beforeUpdate.from);
        
        // Step 2: Perform the update
        console.log('🔄 Performing update...');
        const updatedFeedback = await Feedback.findOneAndUpdate(
            { feedBackId: id },
            { isDisplay: isDisplay },
            { new: true, runValidators: true }
        );

        if (!updatedFeedback) {
            console.log('❌ Update returned null!');
            throw new Error('Update failed - document not found');
        }

        console.log('✅ Update completed:');
        console.log('   BEFORE isDisplay:', beforeUpdate.isDisplay);
        console.log('   AFTER isDisplay:', updatedFeedback.isDisplay);
        console.log('   Changed?', beforeUpdate.isDisplay !== updatedFeedback.isDisplay);
        console.log('==========================================');

        return {
            success: true,
            message: `Feedback ${isDisplay ? 'shown' : 'hidden'} on client site`,
            data: updatedFeedback
        };
    } catch (error) {
        console.error('❌ SERVICE ERROR:', error.message);
        console.error('   Stack:', error.stack);
        console.log('==========================================');
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