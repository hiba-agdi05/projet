const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const USERS_FILE = path.join(__dirname, 'users.json');

// Lire les utilisateurs depuis le fichier JSON
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Inscription
app.post('/api/register', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Champs requis manquants.' });
  }

  const users = readUsers();
  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ message: 'Utilisateur déjà existant.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword, role });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');

  res.status(201).json({ message: 'Utilisateur inscrit avec succès.' });
});

// Connexion
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Email ou mot de passe invalide.' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Email ou mot de passe invalide.' });
  }

  res.status(200).json({ role: user.role });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});