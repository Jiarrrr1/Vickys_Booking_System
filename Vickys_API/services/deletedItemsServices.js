// ============================================
// BACKEND: DeletedItems Service
// ============================================
// File: services/deletedItemsService.js

const DeletedItem = require('../models/DeletedItem.Model');
const Feedback = require('../models/Feedback.Model');
const Booking = require('../models/Reservation.Model');
const Payment = require('../models/Payment.Model');

class DeletedItemsService {
    /**
     * Soft delete an item (move to trash)
     */
    async moveToTrash(itemType, originalId, deletedBy = null) {
        try {
            let originalData;
            let Model;
            
            // ID field mapping for different item types
            const idFieldMap = {
                'feedback': 'feedBackId',
                'booking': 'reservationId',
                'payment': 'paymentId'
            };
            
            const idField = idFieldMap[itemType];
            
            if (!idField) {
                throw new Error(`Unknown item type: ${itemType}`);
            }
            
            // Determine which model to use
            switch(itemType) {
                case 'feedback':
                    Model = Feedback;
                    break;
                case 'booking':
                    Model = Booking;
                    break;
                case 'payment':
                    Model = Payment;
                    break;
                default:
                    throw new Error(`Unknown item type: ${itemType}`);
            }
            
            // Find the original item
            const query = {};
            query[idField] = originalId;
            
            console.log(`🔍 Finding ${itemType} with query:`, query);
            
            originalData = await Model.findOne(query);
            
            if (!originalData) {
                throw new Error(`${itemType} with ID ${originalId} not found`);
            }
            
            // Create deleted item record
            const deletedItem = new DeletedItem({
                originalId: originalId,
                itemType: itemType,
                originalData: originalData.toObject(),
                deletedBy: deletedBy,
                deletedAt: new Date(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
            
            await deletedItem.save();
            
            // Soft delete the original
            const updateQuery = {};
            updateQuery[idField] = originalId;
            
            await Model.findOneAndUpdate(
                updateQuery,
                { 
                    isDeleted: true,
                    deletedAt: new Date()
                },
                { new: true }
            );
            
            return {
                success: true,
                message: `${itemType} moved to trash`,
                data: deletedItem
            };
        } catch (error) {
            console.error('Error moving item to trash:', error);
            throw error;
        }
    }
    
    /**
     * Get all deleted items with filters
     */
    async getAllDeleted(filters = {}) {
        try {
            const query = {};
            
            // Filter by type
            if (filters.itemType) {
                query.itemType = filters.itemType;
            }
            
            // Filter by date range
            if (filters.startDate || filters.endDate) {
                query.deletedAt = {};
                if (filters.startDate) query.deletedAt.$gte = new Date(filters.startDate);
                if (filters.endDate) query.deletedAt.$lte = new Date(filters.endDate);
            }
            
            const deletedItems = await DeletedItem
                .find(query)
                .sort({ deletedAt: -1 })
                .exec();
            
            return {
                success: true,
                data: deletedItems
            };
        } catch (error) {
            console.error('Error fetching deleted items:', error);
            throw error;
        }
    }
    
    /**
     * Restore a single deleted item
     */
    async restoreItem(deletedItemId) {
        try {
            const deletedItem = await DeletedItem.findById(deletedItemId);
            
            if (!deletedItem) {
                throw new Error('Deleted item not found');
            }
            
            let Model;
            const { itemType, originalId } = deletedItem;
            
            // Get the appropriate model
            switch(itemType) {
                case 'feedback':
                    Model = Feedback;
                    break;
                case 'booking':
                    Model = Booking;
                    break;
                case 'payment':
                    Model = Payment;
                    break;
                default:
                    throw new Error(`Unknown item type: ${itemType}`);
            }
            
            // Create query based on item type
            let query = {};
            if (itemType === 'feedback') {
                query = { feedBackId: originalId };
            } else if (itemType === 'booking') {
                query = { reservationId: originalId };
            } else if (itemType === 'payment') {
                query = { paymentId: originalId };
            }
            
            // Restore the item
            const restored = await Model.findOneAndUpdate(
                query,
                {
                    isDeleted: false,
                    deletedAt: null
                },
                { new: true }
            );
            
            if (!restored) {
                console.warn(`⚠️ No ${itemType} found with ID ${originalId} to restore`);
            }
            
            // Remove from deleted items
            await DeletedItem.findByIdAndDelete(deletedItemId);
            
            return {
                success: true,
                message: `${itemType} restored successfully`,
                data: restored
            };
        } catch (error) {
            console.error('Error restoring item:', error);
            throw error;
        }
    }
    
    /**
     * Restore multiple items
     */
    async restoreMultipleItems(itemIds) {
        try {
            console.log(`🔄 Restoring ${itemIds.length} items`);
            
            let successCount = 0;
            let errorCount = 0;
            const errors = [];
            
            for (const itemId of itemIds) {
                try {
                    await this.restoreItem(itemId);
                    successCount++;
                } catch (error) {
                    errorCount++;
                    errors.push({ itemId, error: error.message });
                }
            }
            
            return {
                success: true,
                message: `Restored ${successCount} items, ${errorCount} errors`,
                data: { successCount, errorCount, errors }
            };
        } catch (error) {
            console.error('Error restoring multiple items:', error);
            throw error;
        }
    }
    
    /**
     * Permanently delete a single item
     */
    async permanentlyDelete(deletedItemId) {
        try {
            const deletedItem = await DeletedItem.findById(deletedItemId);
            
            if (!deletedItem) {
                throw new Error('Deleted item not found');
            }
            
            const { itemType, originalId } = deletedItem;
            let Model;
            
            switch(itemType) {
                case 'feedback':
                    Model = Feedback;
                    break;
                case 'booking':
                    Model = Booking;
                    break;
                case 'payment':
                    Model = Payment;
                    break;
                default:
                    throw new Error(`Unknown item type: ${itemType}`);
            }
            
            // Create query based on item type
            let query = {};
            if (itemType === 'feedback') {
                query = { feedBackId: originalId };
            } else if (itemType === 'booking') {
                query = { reservationId: originalId };
            } else if (itemType === 'payment') {
                query = { paymentId: originalId };
            }
            
            // Permanently delete from original collection
            await Model.findOneAndDelete(query);
            
            // Remove from trash collection
            await DeletedItem.findByIdAndDelete(deletedItemId);
            
            return {
                success: true,
                message: `${itemType} permanently deleted`
            };
        } catch (error) {
            console.error('Error permanently deleting item:', error);
            throw error;
        }
    }
    
    /**
     * Permanently delete multiple items
     */
    async permanentlyDeleteMultiple(itemIds) {
        try {
            console.log(`🗑️ Permanently deleting ${itemIds.length} items`);
            
            let successCount = 0;
            let errorCount = 0;
            const errors = [];
            
            for (const itemId of itemIds) {
                try {
                    await this.permanentlyDelete(itemId);
                    successCount++;
                } catch (error) {
                    errorCount++;
                    errors.push({ itemId, error: error.message });
                }
            }
            
            return {
                success: true,
                message: `Permanently deleted ${successCount} items, ${errorCount} errors`,
                data: { successCount, errorCount, errors }
            };
        } catch (error) {
            console.error('Error deleting multiple items:', error);
            throw error;
        }
    }
    
    /**
     * Empty ALL trash items (no filters)
     */
    async emptyAllTrash() {
        try {
            console.log('🧹 Emptying ALL trash items');
            
            const itemsToDelete = await DeletedItem.find({});
            console.log(`📊 Found ${itemsToDelete.length} total items to delete`);
            
            let deletedCount = 0;
            let errorCount = 0;
            
            for (const item of itemsToDelete) {
                try {
                    await this.permanentlyDelete(item._id);
                    deletedCount++;
                } catch (error) {
                    errorCount++;
                    console.error(`❌ Failed to delete item ${item._id}:`, error.message);
                }
            }
            
            return {
                success: true,
                message: `Emptied ${deletedCount} items from trash${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
                data: { deletedCount, errorCount }
            };
        } catch (error) {
            console.error('❌ Error emptying trash:', error);
            throw error;
        }
    }
    
    /**
     * Empty trash older than specified days
     */
    async emptyTrashOlderThan(days) {
        try {
            console.log(`🧹 Emptying trash older than ${days} days`);
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            const itemsToDelete = await DeletedItem.find({
                deletedAt: { $lte: cutoffDate }
            });
            
            console.log(`📊 Found ${itemsToDelete.length} items older than ${days} days`);
            
            let deletedCount = 0;
            let errorCount = 0;
            
            for (const item of itemsToDelete) {
                try {
                    await this.permanentlyDelete(item._id);
                    deletedCount++;
                } catch (error) {
                    errorCount++;
                }
            }
            
            return {
                success: true,
                message: `Deleted ${deletedCount} items older than ${days} days${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
                data: { deletedCount, errorCount, days }
            };
        } catch (error) {
            console.error('❌ Error emptying trash by age:', error);
            throw error;
        }
    }
    
    /**
     * Empty trash by type(s)
     */
    async emptyTrashByType(types) {
        try {
            console.log(`🧹 Emptying trash by types:`, types);
            
            const itemsToDelete = await DeletedItem.find({
                itemType: { $in: types }
            });
            
            console.log(`📊 Found ${itemsToDelete.length} items of types:`, types);
            
            let deletedCount = 0;
            let errorCount = 0;
            const deletedByType = {};
            
            // Initialize counters
            types.forEach(type => deletedByType[type] = 0);
            
            for (const item of itemsToDelete) {
                try {
                    await this.permanentlyDelete(item._id);
                    deletedCount++;
                    deletedByType[item.itemType] = (deletedByType[item.itemType] || 0) + 1;
                } catch (error) {
                    errorCount++;
                }
            }
            
            return {
                success: true,
                message: `Deleted ${deletedCount} items by type${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
                data: { deletedCount, errorCount, deletedByType }
            };
        } catch (error) {
            console.error('❌ Error emptying trash by type:', error);
            throw error;
        }
    }
    
    /**
     * Get trash statistics
     */
    async getTrashStats() {
        try {
            const totalItems = await DeletedItem.countDocuments();
            
            const byType = await DeletedItem.aggregate([
                {
                    $group: {
                        _id: "$itemType",
                        count: { $sum: 1 }
                    }
                }
            ]);
            
            const byAge = await DeletedItem.aggregate([
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$deletedAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: -1 } },
                { $limit: 30 }
            ]);
            
            const oldestItem = await DeletedItem.findOne().sort({ deletedAt: 1 });
            const newestItem = await DeletedItem.findOne().sort({ deletedAt: -1 });
            
            return {
                success: true,
                data: {
                    totalItems,
                    byType: byType.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {}),
                    byAge,
                    oldestDate: oldestItem?.deletedAt,
                    newestDate: newestItem?.deletedAt
                }
            };
        } catch (error) {
            console.error('Error getting trash stats:', error);
            throw error;
        }
    }
}

module.exports = new DeletedItemsService();