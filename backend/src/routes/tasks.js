/* eslint-env node */
const express = require('express');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware de autenticação
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido.' });
  }
}

// Listar tarefas do usuário
router.get('/', auth, async (req, res) => {
  const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(tasks);
});

// Criar tarefa
router.post('/', auth, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Texto obrigatório.' });
  const task = new Task({ user: req.userId, text });
  await task.save();
  res.status(201).json(task);
});

// Atualizar tarefa
router.put('/:id', auth, async (req, res) => {
  const { text, completed } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { text, completed },
    { new: true }
  );
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  res.json(task);
});

// Deletar tarefa
router.delete('/:id', auth, async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  res.json({ message: 'Tarefa removida.' });
});

module.exports = router; 