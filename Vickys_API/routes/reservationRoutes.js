const ReservationController = require("../controllers/reservationControllers")

const express = require('express');
const router = express.Router();

router.post('/reservations', ReservationController.createReservation);

module.exports = router