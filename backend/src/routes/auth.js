/* eslint-env node */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function normalizeUsername(value = '') {
  return value.trim().toLowerCase();
}

router.post('/register', async (req, res) => {
  const username = normalizeUsername(req.body.username);
  const password = req.body.password || '';
  const fullName = (req.body.fullName || '').trim();

  try {
    if (!username || !password) {
      return res.status(400).json({ error: 'Preencha usuario e senha.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres.' });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ error: 'Usuario ja existe.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash, fullName });
    await user.save();

    return res.status(201).json({
      message: 'Usuario registrado com sucesso.',
      user: {
        id: String(user._id),
        username: user.username,
        fullName: user.fullName,
      },
    });
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao registrar usuario.' });
  }
});

router.post('/login', async (req, res) => {
  const username = normalizeUsername(req.body.username);
  const password = req.body.password || '';

  try {
    if (!username || !password) {
      return res.status(400).json({ error: 'Preencha usuario e senha.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Usuario ou senha invalidos.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Usuario ou senha invalidos.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: String(user._id),
        username: user.username,
        fullName: user.fullName || '',
      },
      username: user.username,
    });
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

module.exports = router;
