const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  imagenUrl: { type: String, default: '' },
  instrucciones: { type: [String], required: true },
  ingredientes: [{
    ingredienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'GlobalIngredient', required: true },
    cantidadRequerida: { type: Number, required: true, min: 0.001 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);