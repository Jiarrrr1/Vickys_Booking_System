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

  // Update feedback display status
  updateFeedbackStatus = tryAndCatch(async (req, res) => {
    const { id } = req.params;
    const { isDisplay } = req.body;
    const response = await FeedbackServices.updateFeedbackStatus(id, isDisplay);
    return res.status(200).json(response);
  });

  // Delete feedback
  deleteFeedback = tryAndCatch(async (req, res) => {
    const { id } = req.params;
    const response = await FeedbackServices.deleteFeedback(id);
    return res.status(200).json(response);
  });

  // Get only approved feedback (for client side)
  getApprovedFeedback = tryAndCatch(async (req, res) => {
    const response = await FeedbackServices.getApprovedFeedback();
    return res.status(200).json(response);
  });
}

module.exports = new FeedbackController();