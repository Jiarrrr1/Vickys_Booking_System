const express = require('express');
const router = express.Router();
const RoomContoller = require("../controllers/roomController");

router.get('/getAllRooms', RoomContoller.getAllRooms);
router.get('/getRoom/:id', RoomContoller.getRoomById);
router.post('/createRoom', RoomContoller.createRoom);
router.put('/updateRoom/:id', RoomContoller.updateRoom);

module.exports = router;