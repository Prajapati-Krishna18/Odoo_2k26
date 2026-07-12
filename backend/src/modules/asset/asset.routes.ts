import { Router } from 'express';

const router = Router();

// POST /api/assets - Create a new asset
// router.post('/', assetController.createAsset);

// GET /api/assets - Get all assets with pagination and filtering
// router.get('/', assetController.getAssets);

// GET /api/assets/:id - Get asset by ID
// router.get('/:id', assetController.getAssetById);

// PUT /api/assets/:id - Update asset
// router.put('/:id', assetController.updateAsset);

// DELETE /api/assets/:id - Delete asset
// router.delete('/:id', assetController.deleteAsset);

// PATCH /api/assets/:id/status - Update asset status
// router.patch('/:id/status', assetController.updateAssetStatus);

// GET /api/assets/search - Search assets
// router.get('/search', assetController.searchAssets);

// GET /api/assets/filter - Filter assets
// router.get('/filter', assetController.filterAssets);

export { router as assetRoutes };
