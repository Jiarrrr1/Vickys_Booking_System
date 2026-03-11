const Room = require('../models/RoomModel');
const generateId = require("../utils/generateId");

// Room configuration mapping for frontend
const ROOM_CONFIG = {
    'Rose Room': {
        icon: '🌹',
        shortName: 'Rose',
        capacity: '5-8 pax',
        quantity: 1
    },
    'Tulip Room': {
        icon: '🌷',
        shortName: 'Tulip',
        capacity: '5-8 pax',
        quantity: 1
    },
    'Callalily Room': {
        icon: '🌸',
        shortName: 'Callalily',
        capacity: '5-8 pax',
        quantity: 1
    },
    'Stargazer Room': {
        icon: '⭐',
        shortName: 'Stargazer',
        capacity: '10-20 pax',
        quantity: 1
    },
    'Garden Cottage': {
        icon: '🏡',
        shortName: 'Cottage',
        capacity: '8-12 pax',
        quantity: 5  // Multiple cottages available
    }
};

class RoomServices {

    async createRoom(payload) {
        try {
            const newId = await generateId();
            
            const newRoom = new Room({
                roomId: newId,
                roomNumber: payload.roomNumber,
                type: payload.type,
                price: payload.price,
                status: payload.status || 'Available',
                amenities: payload.amenities || [],
            });
            await newRoom.save();
            return {
                success: true,
                message: "Room created successfully",
                data: newRoom,
            };
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    }

    async getAllRooms() {
        try {
            const rooms = await Room.find();
            
            // Transform rooms to match frontend structure
            const transformedRooms = rooms.map((room, index) => {
                const config = ROOM_CONFIG[room.roomNumber] || {
                    icon: '🏨',
                    shortName: room.roomNumber,
                    capacity: '1-5 pax',
                    quantity: 1
                };
                
                return {
                    id: index + 1,  // Sequential ID for frontend
                    roomId: room.roomId,  // Database ID (e.g., R001)
                    name: room.roomNumber,
                    icon: config.icon,
                    shortName: config.shortName,
                    type: room.type,
                    quantity: config.quantity,
                    capacity: config.capacity,
                    price: room.price,
                    status: room.status,
                    amenities: room.amenities || [],
                    available: room.status === 'Available'
                };
            });
            
            return {
                success: true,
                data: transformedRooms,
                count: transformedRooms.length
            };
        } catch (error) {
            console.error('Error getting rooms:', error);
            throw error;
        }
    }

    async getRoomById(roomId) {
        try {
            const room = await Room.findOne({ roomId: roomId });
            if (!room) {
                return {
                    success: false,
                    message: "Room not found",
                };
            }

            // Transform single room
            const config = ROOM_CONFIG[room.roomNumber] || {
                icon: '🏨',
                shortName: room.roomNumber,
                capacity: '1-5 pax',
                quantity: 1
            };

            const transformedRoom = {
                id: room._id,
                roomId: room.roomId,
                name: room.roomNumber,
                icon: config.icon,
                shortName: config.shortName,
                type: room.type,
                quantity: config.quantity,
                capacity: config.capacity,
                price: room.price,
                status: room.status,
                amenities: room.amenities || [],
                available: room.status === 'Available'
            };

            return {
                success: true,
                data: transformedRoom
            };
        } catch (error) {
            console.error('Error getting room:', error);
            throw error;
        }
    }

    async updateRoom(roomId, payload) {
        try {
            const updatedRoom = await Room.findOneAndUpdate(
                { roomId: roomId },
                payload,
                { new: true, runValidators: true }
            );
            if (!updatedRoom) {
                return {
                    success: false,
                    message: "Room not found",
                };
            }
            return {
                success: true,
                message: "Room updated successfully",
                data: updatedRoom
            };
        } catch (error) {
            console.error('Error updating room:', error);
            throw error;
        }
    }

}

module.exports = new RoomServices();