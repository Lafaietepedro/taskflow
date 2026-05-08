/* eslint-env node */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const serializeUser = require('../utils/serializers/user');

const router = express.Router();
const VALID_PLANS = new Set(['solo', 'team', 'pro']);

function normalizeUsername(value = '') {
  return value.trim().toLowerCase();
}

router.post('/register', async (req, res) => {
  const username = normalizeUsername(req.body.username);
  const password = req.body.password || '';
  const fullName = (req.body.fullName || '').trim();
  const plan = VALID_PLANS.has(req.body.plan) ? req.body.plan : 'team';

  try {
    if (!username || !password) {
      return res.status(400).json({ error: 'Preencha usuário e senha.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres.' });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash, fullName, plan });
    await user.save();

    return res.status(201).json({
      message: 'Usuário registrado com sucesso.',
      user: serializeUser(user),
    });
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
});

router.post('/login', async (req, res) => {
  const username = normalizeUsername(req.body.username);
  const password = req.body.password || '';

  try {
    if (!username || !password) {
      return res.status(400).json({ error: 'Preencha usuário e senha.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Usuário ou senha inválidos.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Usuário ou senha inválidos.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: serializeUser(user),
      username: user.username,
    });
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json({ user: serializeUser(user) });
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao carregar usuário.' });
  }
});

router.post('/checkout-intent', auth, async (req, res) => {
  const requestedPlan = VALID_PLANS.has(req.body.requestedPlan) ? req.body.requestedPlan : 'team';
  const contactMethod = String(req.body.contactMethod || 'whatsapp').trim();
  const contactValue = String(req.body.contactValue || '').trim();
  const notes = String(req.body.notes || '').trim();

  try {
    if (!contactValue) {
      return res.status(400).json({ error: 'Informe um WhatsApp ou contato para concluir a solicitação.' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        plan: requestedPlan,
        subscriptionStatus: 'checkout_requested',
        checkoutIntent: {
          requestedPlan,
          contactMethod,
          contactValue,
          notes,
          requestedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json({
      message: 'Intenção de assinatura registrada. Próximo passo: contato comercial e checkout real.',
      user: serializeUser(user),
    });
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao registrar intenção de assinatura.' });
  }
});

module.exports = router;
