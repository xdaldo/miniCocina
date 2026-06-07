const UserInventory = require('../models/UserInventory');
const GlobalIngredient = require('../models/GlobalIngredient');

exports.getUserInventory = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email requerido' });
    const inventario = await UserInventory.find({ email: email.toLowerCase() }).populate('ingredienteId');
    res.json(inventario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.adjustInventory = async (req, res) => {
  try {
    const { email, ingredienteId, cantidadDelta } = req.body;
    if (!email || !ingredienteId || cantidadDelta === undefined) {
      return res.status(400).json({ error: 'Faltan datos' });
    }
    // Verificar que el ingrediente global existe
    const globalIng = await GlobalIngredient.findById(ingredienteId);
    if (!globalIng) return res.status(404).json({ error: 'Ingrediente no existe en catálogo global' });
    
    let item = await UserInventory.findOne({ email: email.toLowerCase(), ingredienteId });
    if (!item && cantidadDelta < 0) return res.status(400).json({ error: 'No puedes restar algo que no tienes' });
    
    if (!item && cantidadDelta > 0) {
      item = new UserInventory({ email: email.toLowerCase(), ingredienteId, cantidad: 0 });
    }
    const nuevaCantidad = item.cantidad + cantidadDelta;
    if (nuevaCantidad <= 0) {
      await UserInventory.deleteOne({ _id: item._id });
      res.json({ mensaje: 'Ingrediente eliminado de tu cocina' });
    } else {
      item.cantidad = nuevaCantidad;
      await item.save();
      res.json({ mensaje: 'Inventario actualizado', cantidad: nuevaCantidad });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};