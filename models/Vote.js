const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  score: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });

voteSchema.index({ email: 1, recipeId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);