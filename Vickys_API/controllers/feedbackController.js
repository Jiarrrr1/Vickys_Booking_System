const FeedbackServices = require("../services/feedbackServices");
const tryAndCatch = require("../utils/tryAndCatch");

class FeedbackController {
  createFeedback = tryAndCatch(async (req, res) => {
    const payload = req.body;
    const response = await FeedbackServices.createFeedback(payload);
    return res.status(200).json(response);
  });

  // Get all feedback (admin)
  getAllFeedback = tryAndCatch(async (req, res) => {
    const response = await FeedbackServices.getAllFeedback();
    return res.status(200).json(response);
  });

  // Get feedback by ID
  getFeedbackById = tryAndCatch(async (req, res) => {
    const { id } = req.params;
    const response = await FeedbackServices.getFeedbackById(id);
    return res.status(200).json(response);
  });

 // Enhanced updateFeedbackStatus controller method

updateFeedbackStatus = tryAndCatch(async (req, res) => {
    console.log('🎯 CONTROLLER: updateFeedbackStatus called');
    console.log('   Params:', req.params);
    console.log('   Body:', req.body);
    
    const { id } = req.params;
    const { isDisplay } = req.body;
    
    console.log('   Extracted id:', id);
    console.log('   Extracted isDisplay:', isDisplay);
    
    const response = await FeedbackServices.updateFeedbackStatus(id, isDisplay);
    
    console.log('✅ CONTROLLER: Service returned:');
    console.log('   success:', response.success);
     console.log('   message:', response.message);
    console.log('   data.isDisplay:', response.data?.isDisplay);
    
    return res.status(200).json(response);
});

  // Soft delete feedback (move to trash)
    deleteFeedback = tryAndCatch(async (req, res) => {
        const { id } = req.params;
        const { deletedBy } = req.body;  // Optional
        
        const response = await FeedbackServices.deleteFeedback(
            id, 
            deletedBy, 
        );
        return res.status(200).json(response);
    });

  // Get only approved feedback (for client side)
  getApprovedFeedback = tryAndCatch(async (req, res) => {
    const response = await FeedbackServices.getApprovedFeedback();
    return res.status(200).json(response);
  });
}

module.exports = new FeedbackController();