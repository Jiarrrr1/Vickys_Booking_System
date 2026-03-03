const FeedbackController = require("../controllers/feedbackController")
const express = require('express');
const router = express.Router();

// Public route (no auth)
router.post('/createFeedback', FeedbackController.createFeedback);

// Admin routes (add auth middleware in your main router)
router.get('/admin/getAllFeedback', FeedbackController.getAllFeedback);
router.get('/admin/getFeedback/:id', FeedbackController.getFeedbackById);
router.patch('/admin/updateFeedbackStatus/:id', FeedbackController.updateFeedbackStatus);
router.delete('/admin/deleteFeedback/:id', FeedbackController.deleteFeedback);

// Client route - only returns approved feedback
router.get('/getApprovedFeedback', FeedbackController.getApprovedFeedback);

module.exports = router;