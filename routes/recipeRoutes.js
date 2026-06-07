const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

router.get('/', recipeController.getRecipes);
router.post('/', recipeController.createRecipe);
router.post('/rate/:id', recipeController.rateRecipe);
router.post('/cook/:id', recipeController.cookRecipe);

module.exports = router;