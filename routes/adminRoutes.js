const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

const adminAuth = (req, res, next) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });
  next();
};

router.post('/ingredients', adminAuth, adminController.addIngredient);
router.get('/ingredients', adminController.listIngredients); // público para lectura

module.exports = router;