const RoomServices = require('../services/roomServices');
const tryAndCatch = require('../utils/tryAndCatch');

class RoomController {
    getAllRooms = tryAndCatch(async (req, res) => {
        const response = await RoomServices.getAllRooms();
        return res.status(200).json(response);
    })

    getRoomById = tryAndCatch(async (req, res) => {
        const { roomId } = req.params;
        const response = await RoomServices.getRoomById(roomId);
        return res.status(200).json(response);
    })

    createRoom = tryAndCatch(async (req, res) => {
        const payload = req.body;
        console.log('🎯 CONTROLLER: createRoom called with payload:', payload);
        
        const response = await RoomServices.createRoom(payload);
        return res.status(200).json(response);
    })

    updateRoom = tryAndCatch(async (req, res) => {
        const { roomId } = req.params;
        const payload = req.body;
        const response = await RoomServices.updateRoom(roomId, payload);
        return res.status(200).json(response);
    })
}   

module.exports = new RoomController();