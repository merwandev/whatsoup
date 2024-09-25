const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone_number: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile_image: { type: String },
  is_suppr: { type: Boolean, default: false }, // Champ pour marquer un utilisateur comme supprimé
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
