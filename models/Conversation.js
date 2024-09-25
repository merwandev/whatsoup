const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  title: { type: String },
  user_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Référence aux utilisateurs
  is_suppr: { type: Boolean, default: false }, // Champ pour marquer une conversation comme supprimée
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
