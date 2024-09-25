const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content_url: { type: String, required: true }, // URL de l'image ou de la vidéo de la story
  content_type: { type: String, required: true }, // Le type de contenu (image ou vidéo)
  is_suppr: { type: Boolean, default: false }, // Champ pour marquer une story comme supprimée
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000 } // Expiration après 24h
});

module.exports = mongoose.model('Story', storySchema);
