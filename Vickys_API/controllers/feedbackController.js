const FeedbackServices = require("../services/feedbackServices");
const tryAndCatch = require("../utils/tryAndCatch");

class FeedbackController {
  createFeedback = tryAndCatch(async (req, res) => {

    const payload = req.body;

    const response = await FeedbackServices.createFeedback(req.body);
    
    return res.status(200).json(response);
  });
}

module.exports = new FeedbackController();
