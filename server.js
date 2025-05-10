const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const db = require("./db"); // Connexion à la base SQLite

const app = express();
const PORT = 3000;
const SECRET = "secret_key";

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// ✅ Accueil
app.get("/", (req, res) => {
  res.send("Welcome to the Exam Platform Backend!");
});

// ✅ Inscription
app.post("/api/register", (req, res) => {
  const { username, password, role } = req.body;

  try {
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run(username, password, role);
    res.json({ message: "Inscription réussie" });
  } catch (err) {
    res.status(400).json({ error: "Utilisateur existe déjà" });
  }
});

// ✅ Connexion
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
  if (!user) return res.status(401).json({ error: "Identifiants incorrects" });

  const token = jwt.sign({ username: user.username, role: user.role }, SECRET, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
  res.json({ message: "Connexion réussie", token });
});

// ✅ Déconnexion
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Déconnexion réussie" });
});

// ✅ Auth middleware
function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Non autorisé" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Token invalide" });
  }
}

// ✅ Liste des étudiants
app.get("/api/etudiants", (req, res) => {
  const etudiants = db.prepare("SELECT username, role FROM users WHERE role = 'etudiant'").all();
  res.json(etudiants);
});

// ✅ Ajouter une question
app.post("/api/questions", (req, res) => {
  const { question, options, correctAnswer } = req.body;
  const optionsJSON = JSON.stringify(options);

  db.prepare("INSERT INTO questions (question, options, correctAnswer) VALUES (?, ?, ?)")
    .run(question, optionsJSON, correctAnswer);

  res.json({ message: "Question ajoutée" });
});

// ✅ Récupérer les questions
app.get("/api/questions", (req, res) => {
  const rows = db.prepare("SELECT * FROM questions").all();

  const questions = rows.map(q => ({
    question: q.question,
    options: JSON.parse(q.options),
    correctAnswer: q.correctAnswer
  }));

  res.json(questions);
});

// ✅ Soumettre les réponses
app.post("/api/submit", (req, res) => {
  const { answers } = req.body;

  let score = 0;
  const questions = db.prepare("SELECT * FROM questions").all();

  answers.forEach((response) => {
    const q = questions.find((q) => q.question === response.question);
    if (q && q.correctAnswer === response.answer) {
      score++;
    }
  });

  res.json({ message: "Réponses reçues", score, total: questions.length });
});

// ✅ Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur Node.js lancé sur http://localhost:${PORT}`);
});
