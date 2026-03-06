const reservationServices = require("../services/reservationServices")
const tryandCatch = require("../utils/tryAndCatch")
const DeletedItemsService = require('../services/deletedItemsServices');

class ReservationController {
    createReservation = tryandCatch(async (req, res) => {
        const response = await reservationServices.createReservation(req.body)
        return res.status(200).json(response)
    })

    getAllReservations = tryandCatch(async (req, res) => {
        const response = await reservationServices.getAllReservations()
        return res.status(200).json(response)
    })

    getReservation = tryandCatch(async (req, res) => {
        const id = req.params.id

        const response = await reservationServices.getReservation(id)
        return res.status(200).json(response)
    })

    updateStatus = tryandCatch(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body; // Extract status from body

        const updated = await reservationServices.updateStatus(id, status);

        return res.status(200).json({
            success: true,
            data: updated
        });
    })

    updateNotes = tryandCatch(async (req, res) => {
        const { id } = req.params;
        const { notes } = req.body; // Extract notes from body

        const updated = await reservationServices.updateNotes(id, notes);

        return res.status(200).json({
            success: true,
            data: updated
        });
    })
    // Soft delete booking (move to trash)
async deleteBooking(req, res) {
    try {
        const { id } = req.params;
        const deletedBy = req.admin?.email || 'Admin';
        
        console.log(`🗑️ Soft deleting booking: ${id} by ${deletedBy}`);
        
        const result = await DeletedItemsService.moveToTrash(
            'booking',  // item type
            id,         // original ID (reservationId)
            deletedBy   // who deleted it
        );
        
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting booking:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

        
}

module.exports = new ReservationController();