onst express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve les fichiers HTML, CSS, JS

// MongoDB setup
const uri = 'mongodb://localhost:27017';
const dbName = 'exam_platform';
let usersCollection;

MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    console.log('✅ Connecté à MongoDB');
    const db = client.db(dbName);
    usersCollection = db.collection('users');

    app.listen(PORT, () => {
      console.log(🚀 Serveur démarré sur http://localhost:${PORT});
    });
  })
  .catch(err => console.error('❌ Erreur MongoDB :', err));

// Register route
app.post('/api/register', async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  try {
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Utilisateur existe déjà' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role
    });

    res.status(201).json({ message: 'Inscription réussie' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Identifiants invalides' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Connexion réussie', token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
}
);