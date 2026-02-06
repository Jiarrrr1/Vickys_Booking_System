const FeedbackController = require("../controllers/feedbackController")

const express = require('express');
const router = express.Router();

router.post('/createFeedback', FeedbackController.createFeedback);

module.exports = router