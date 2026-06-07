const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/userInventoryController');

router.get('/', inventoryController.getUserInventory);
router.post('/adjust', inventoryController.adjustInventory);

module.exports = router;