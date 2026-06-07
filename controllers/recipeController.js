const Recipe = require('../models/Recipe');
const Vote = require('../models/Vote');
const UserInventory = require('../models/UserInventory');
const GlobalIngredient = require('../models/GlobalIngredient');

exports.getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('ingredientes.ingredienteId');
    const email = req.query.email;
    const recipesWithData = await Promise.all(recipes.map(async (recipe) => {
      const votes = await Vote.find({ recipeId: recipe._id });
      const avgScore = votes.length ? votes.reduce((s, v) => s + v.score, 0) / votes.length : 0;
      const userVote = email ? await Vote.findOne({ email: email.toLowerCase(), recipeId: recipe._id }) : null;
      // Calcular disponibilidad para este usuario
      let totalIng = recipe.ingredientes.length;
      let disponibles = 0;
      if (email) {
        for (let reqIng of recipe.ingredientes) {
          const userItem = await UserInventory.findOne({ email: email.toLowerCase(), ingredienteId: reqIng.ingredienteId._id });
          const cantidadStock = userItem ? userItem.cantidad : 0;
          if (cantidadStock >= reqIng.cantidadRequerida - 0.0001) disponibles++;
        }
      }
      const porcentaje = totalIng ? (disponibles / totalIng) : 0;
      return {
        ...recipe.toObject(),
        avgScore: Math.round(avgScore * 10) / 10,
        userScore: userVote ? userVote.score : null,
        totalVotes: votes.length,
        disponibilidad: { disponibles, totalIng, porcentaje }
      };
    }));
    res.json(recipesWithData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    const { nombre, imagenUrl, instrucciones, ingredientes } = req.body;
    if (!nombre || !instrucciones || !ingredientes || ingredientes.length === 0) {
      return res.status(400).json({ error: 'Faltan datos' });
    }
    // Validar que cada ingrediente existe en catálogo global y respete tipo
    for (let ing of ingredientes) {
      const global = await GlobalIngredient.findById(ing.ingredienteId);
      if (!global) return res.status(400).json({ error: `Ingrediente ${ing.ingredienteId} no existe` });
      if (global.tipoMedida === 'unidad' && !Number.isInteger(ing.cantidadRequerida)) {
        return res.status(400).json({ error: `${global.nombre} requiere cantidad entera` });
      }
    }
    const recipe = new Recipe({ nombre, imagenUrl, instrucciones, ingredientes });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cookRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });
    const recipe = await Recipe.findById(id).populate('ingredientes.ingredienteId');
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });
    
    // Verificar suficiencia en inventario del usuario
    const faltantes = [];
    const itemsAUpdate = [];
    for (let reqIng of recipe.ingredientes) {
      const userItem = await UserInventory.findOne({ email: email.toLowerCase(), ingredienteId: reqIng.ingredienteId._id });
      const disponible = userItem ? userItem.cantidad : 0;
      if (disponible < reqIng.cantidadRequerida - 0.0001) {
        faltantes.push(`${reqIng.ingredienteId.nombre}: necesita ${reqIng.cantidadRequerida}, tiene ${disponible}`);
      } else {
        itemsAUpdate.push({ userItem, nuevaCantidad: disponible - reqIng.cantidadRequerida, id: reqIng.ingredienteId._id });
      }
    }
    if (faltantes.length) {
      return res.status(400).json({ error: 'Faltan ingredientes', detalles: faltantes });
    }
    // Descontar
    for (let { userItem, nuevaCantidad } of itemsAUpdate) {
      if (nuevaCantidad <= 0) {
        await UserInventory.deleteOne({ _id: userItem._id });
      } else {
        await UserInventory.updateOne({ _id: userItem._id }, { $set: { cantidad: nuevaCantidad } });
      }
    }
    res.json({ mensaje: '¡Platillo cocinado! Se descontaron los ingredientes.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, score } = req.body;
    if (!email || !score || score < 1 || score > 5) return res.status(400).json({ error: 'Datos inválidos' });
    await Vote.findOneAndUpdate(
      { email: email.toLowerCase(), recipeId: id },
      { score },
      { upsert: true }
    );
    res.json({ mensaje: 'Voto registrado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};