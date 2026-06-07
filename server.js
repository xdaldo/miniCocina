require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const adminRoutes = require('./routes/adminRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const inventoryRoutes = require('./routes/userInventoryRoutes');

const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/admin', adminRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/inventory', inventoryRoutes);

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor en http://localhost:${PORT}`));