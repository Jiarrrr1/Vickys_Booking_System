// ============================================
// BACKEND: Updated Feedback Routes
// ============================================
// File: routes/feedbackRoutes.js (UPDATE)

const FeedbackController = require("../controllers/feedbackController");
const express = require('express');
const router = express.Router();

// Public route
router.post('/createFeedback', FeedbackController.createFeedback);

// Admin routes
router.get('/admin/getAllFeedback', FeedbackController.getAllFeedback);
router.get('/admin/getFeedback/:id', FeedbackController.getFeedbackById);
router.patch('/admin/updateFeedbackStatus/:id', FeedbackController.updateFeedbackStatus);

// UPDATED: Soft delete (move to trash)
router.delete('/admin/deleteFeedback/:id', FeedbackController.deleteFeedback);

// Client route
router.get('/getApprovedFeedback', FeedbackController.getApprovedFeedback);

module.exports = router;