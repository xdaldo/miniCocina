const mongoose = require('mongoose');

const userInventorySchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  ingredienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'GlobalIngredient', required: true },
  cantidad: { type: Number, required: true, min: 0 }
});

userInventorySchema.index({ email: 1, ingredienteId: 1 }, { unique: true });

module.exports = mongoose.model('UserInventory', userInventorySchema);