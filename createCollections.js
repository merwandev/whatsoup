const createCollections = async () => {
    const mongoose = require('mongoose');
    
    try {
      // Connexion à MongoDB Atlas (supprime les options obsolètes)
      await mongoose.connect('mongodb+srv://antoinerichard91:013579@clusterwhatsoup.7laxa.mongodb.net/?retryWrites=true&w=majority&appName=ClusterWhatsoup');
      
      // Crée une collection vide pour chaque modèle
      await mongoose.connection.db.createCollection('users');
      await mongoose.connection.db.createCollection('conversations');
      await mongoose.connection.db.createCollection('messages');
      await mongoose.connection.db.createCollection('stories');
  
      console.log('Collections created');
    } catch (err) {
      console.error('Error creating collections:', err);
    } finally {
      mongoose.connection.close(); // Ferme la connexion une fois terminé
    }
  };
  
  createCollections();
  