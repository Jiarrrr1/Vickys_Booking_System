const reservationServices = require("../services/reservationServices")
const tryandCatch = require("../utils/tryAndCatch")

class ReservationController{
    createReservation = tryandCatch(async (req, res) => {
        const response = await reservationServices.createReservation(req.body)
        return res.status(200).json(response)
    })
}

module.exports = new ReservationController();