const express = require('express');
const connectDB = require('./db'); // Importation de la connexion MongoDB

const app = express();

// Connexion à MongoDB
connectDB();

app.use(express.json()); // Pour traiter les données JSON

// Exemple de route simple
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
