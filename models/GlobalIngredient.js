const mongoose = require('mongoose');

const globalIngredientSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true, lowercase: true },
  tipoMedida: { type: String, enum: ['unidad', 'metrico'], required: true }
});

module.exports = mongoose.model('GlobalIngredient', globalIngredientSchema);