const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory user database (for simplicity)
const users = [];

// Secret key for JWT
const SECRET_KEY = 'your_secret_key';

// Routes

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to the Exam Platform Backend!');
});

// Registration route
app.post('/api/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if the user already exists
  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save the user
  users.push({
    email,
    password: hashedPassword,
    firstName,
    lastName,
  });

  res.status(201).json({ message: 'User registered successfully' });
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Generate JWT token
  const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });

  res.json({ message: 'Login successful', token });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});