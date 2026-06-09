const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contacts.controller');
const supabaseMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { contactSchema } = require('../schemas');

router.use(supabaseMiddleware); // Apply to all routes in this file

router.get('/', contactsController.getContacts);
router.post('/', validate(contactSchema), contactsController.saveContact);
router.delete('/:id', contactsController.deleteContact);

module.exports = router;
