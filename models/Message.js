const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String }, // Contenu du message textuel (facultatif)
  image_url: { type: String }, // URL de l'image (facultatif)
  video_url: { type: String }, // URL de la vidéo (facultatif)
  audio_url: { type: String }, // URL de l'audio (facultatif)
  is_suppr: { type: Boolean, default: false }, // Champ pour marquer un message comme supprimé
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
