const express = require('express');
const router = express.Router();
const scrapeController = require('../controllers/scrape.controller');
const validate = require('../middlewares/validate.middleware');
const { scrapeSchema, websiteSchema } = require('../schemas');

router.post('/', validate(scrapeSchema), scrapeController.scrape);
router.post('/website', validate(websiteSchema), scrapeController.scrapeWebsite);

module.exports = router;
