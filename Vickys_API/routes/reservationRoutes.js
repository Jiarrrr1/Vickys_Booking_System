const ReservationController = require("../controllers/reservationControllers")

const express = require('express');
const router = express.Router();

router.post('/reservations', ReservationController.createReservation);

router.get('/getAllReservations', ReservationController.getAllReservations);
router.get('/getReservation/:id', ReservationController.getReservation);

router.patch('/updateStatus/:id', ReservationController.updateStatus);


module.exports = router