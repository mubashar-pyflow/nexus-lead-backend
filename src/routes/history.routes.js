const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');
const supabaseMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { searchHistorySchema } = require('../schemas');

router.use(supabaseMiddleware);

// Search History
router.get('/search', historyController.getSearchHistory);
router.post('/search', validate(searchHistorySchema), historyController.addSearchHistory);
router.delete('/search', historyController.clearSearchHistory);
router.delete('/search/:id', historyController.removeSearchHistory);

// Export History
router.get('/export', historyController.getExportHistory);
router.post('/export', historyController.addExportHistory);
router.delete('/export', historyController.clearExportHistory);

module.exports = router;
