const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const users = [];

const SECRET_KEY = 'your_secret_key';

app.get('/', (req, res) => {
  res.send('Welcome to the Exam Platform Backend!');
});

app.post('/api/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({
    email,
    password: hashedPassword,
    firstName,
    lastName,
  });

  res.status(201).json({ message: 'User registered successfully' });
});
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });

  res.json({ message: 'Login successful', token });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});