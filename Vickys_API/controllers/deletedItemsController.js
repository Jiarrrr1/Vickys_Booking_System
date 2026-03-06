// ============================================
// BACKEND: Deleted Items Routes
// ============================================
// File: routes/admin/deletedItemsRoutes.js

const express = require('express');
const router = express.Router();
const DeletedItemsService = require('../services/deletedItemsServices');
const { verifyAdminToken } = require('../middleware/authMiddleware');

// Apply admin authentication to all routes
router.use(verifyAdminToken);

/**
 * GET /admin/deleted
 * Get all deleted items with optional filters
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
            itemType: req.query.itemType,
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };
        
        const result = await DeletedItemsService.getAllDeleted(filters);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * GET /admin/deleted/stats
 * Get trash statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const result = await DeletedItemsService.getTrashStats();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /admin/deleted/:id/restore
 * Restore a single deleted item
 */
router.post('/:id/restore', async (req, res) => {
    try {
        const result = await DeletedItemsService.restoreItem(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /admin/deleted/restore-multiple
 * Restore multiple items
 */
router.post('/restore-multiple', async (req, res) => {
    try {
        const { itemIds } = req.body;
        
        if (!itemIds || !Array.isArray(itemIds)) {
            return res.status(400).json({
                success: false,
                message: 'itemIds array is required'
            });
        }
        
        const result = await DeletedItemsService.restoreMultipleItems(itemIds);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * DELETE /admin/deleted/:id/permanent
 * Permanently delete a single item
 */
router.delete('/:id/permanent', async (req, res) => {
    try {
        const result = await DeletedItemsService.permanentlyDelete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * DELETE /admin/deleted/permanent-multiple
 * Permanently delete multiple items
 */
router.delete('/permanent-multiple', async (req, res) => {
    try {
        const { itemIds } = req.body;
        
        if (!itemIds || !Array.isArray(itemIds)) {
            return res.status(400).json({
                success: false,
                message: 'itemIds array is required'
            });
        }
        
        const result = await DeletedItemsService.permanentlyDeleteMultiple(itemIds);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /admin/deleted/empty-all
 * Empty ALL trash items
 */
router.post('/empty-all', async (req, res) => {
    try {
        const result = await DeletedItemsService.emptyAllTrash();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /admin/deleted/empty-older-than
 * Empty trash older than specified days
 */
router.post('/empty-older-than', async (req, res) => {
    try {
        const { days } = req.body;
        
        if (!days || days < 1) {
            return res.status(400).json({
                success: false,
                message: 'Valid days parameter is required'
            });
        }
        
        const result = await DeletedItemsService.emptyTrashOlderThan(days);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /admin/deleted/empty-by-type
 * Empty trash by type(s)
 */
router.post('/empty-by-type', async (req, res) => {
    try {
        const { types } = req.body;
        
        if (!types || !Array.isArray(types) || types.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'types array is required'
            });
        }
        
        const result = await DeletedItemsService.emptyTrashByType(types);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;