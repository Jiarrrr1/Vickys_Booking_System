const ReservationController = require("../controllers/reservationControllers")

const express = require('express');
const router = express.Router();

router.post('/createReservation', ReservationController.createReservation);

router.get('/getAllReservations', ReservationController.getAllReservations);
router.get('/getReservation/:id', ReservationController.getReservation);

router.patch('/updateStatus/:id', ReservationController.updateStatus);

router.patch('/updateNotes/:id', ReservationController.updateNotes);

module.exports = router