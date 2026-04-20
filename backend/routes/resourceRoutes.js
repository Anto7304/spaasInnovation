const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateResource, handleValidationErrors } = require('../middleware/validation');

// Public routes - Get resources (no auth required)
router.get('/', resourceController.getAllResources);
router.get('/category/:category', resourceController.getResourcesByCategory);
router.get('/:resourceId', resourceController.getResourceById);

// Protected routes - Create/Update/Delete (admin only)
router.post('/', auth, authorize('admin'), validateResource, handleValidationErrors, resourceController.createResource);
router.put('/:resourceId', auth, authorize('admin'), validateResource, handleValidationErrors, resourceController.updateResource);
router.delete('/:resourceId', auth, authorize('admin'), resourceController.deleteResource);

module.exports = router;
