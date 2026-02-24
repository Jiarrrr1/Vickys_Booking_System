const reservationServices = require("../services/reservationServices")
const tryandCatch = require("../utils/tryAndCatch")

class ReservationController{
    createReservation = tryandCatch(async (req, res) => {
        const response = await reservationServices.createReservation(req.body)
        return res.status(200).json(response)
    })

    getAllReservations = tryandCatch(async (req, res) =>{
        const response = await reservationServices.getAllReservations()
        return res.status(200).json(response)
    })

    getReservation = tryandCatch(async (req, res) =>{
        const id = req.params.id
        
        const response = await reservationServices.getReservation(id)
        return res.status(200).json(response)
    })

    updateStatus = tryandCatch(async (req, res) =>{
        const id = req.params.id
        const {payload} = req.body
        console.log(payload);

        const response = await reservationServices.updateStatus(id, payload)
        return res.status(200).json(response)
    })}

module.exports = new ReservationController();