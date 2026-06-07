const GlobalIngredient = require('../models/GlobalIngredient');

exports.addIngredient = async (req, res) => {
  try {
    const { nombre, tipoMedida } = req.body;
    if (!nombre || !tipoMedida) return res.status(400).json({ error: 'Faltan campos' });
    const exists = await GlobalIngredient.findOne({ nombre: nombre.toLowerCase().trim() });
    if (exists) return res.status(400).json({ error: 'El ingrediente ya existe' });
    const newIng = new GlobalIngredient({ nombre: nombre.toLowerCase().trim(), tipoMedida });
    await newIng.save();
    res.json({ mensaje: 'Ingrediente global agregado', ingrediente: newIng });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listIngredients = async (req, res) => {
  try {
    const ingredientes = await GlobalIngredient.find().sort({ nombre: 1 });
    res.json(ingredientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};