const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const validate = require('../middlewares/validate.middleware');
const { outreachSchema } = require('../schemas');

router.post('/generate', validate(outreachSchema), aiController.generateOutreach);

module.exports = router;
