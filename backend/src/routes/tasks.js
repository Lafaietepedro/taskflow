/* eslint-env node */
const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const serializeTask = require('../utils/serializers/task');

const router = express.Router();

const VALID_STATUSES = new Set(['pending', 'in_progress', 'done']);
const VALID_PRIORITIES = new Set(['low', 'medium', 'high']);

function normalizeChecklistItems(items) {
  if (!Array.isArray(items)) {
    return undefined;
  }

  return items
    .map((item) => ({
      label: (item?.label || '').trim(),
      done: Boolean(item?.done),
    }))
    .filter((item) => item.label);
}

function normalizeProofPhoto(photo) {
  if (!photo || typeof photo !== 'object') {
    return null;
  }

  const uri = String(photo.uri || '').trim();
  if (!uri) {
    return null;
  }

  return {
    uri,
    capturedAt: photo.capturedAt ? new Date(photo.capturedAt) : new Date(),
    source: photo.source === 'library' ? 'library' : 'camera',
    mimeType: String(photo.mimeType || 'image/jpeg').trim(),
  };
}

function buildTaskPayload(body = {}, { partial = false } = {}) {
  const payload = {};
  const rawTitle = typeof body.title === 'string' ? body.title : body.text;

  if (rawTitle !== undefined) {
    const title = String(rawTitle).trim();
    if (!title) {
      throw new Error('Titulo obrigatorio.');
    }
    payload.title = title;
    payload.text = title;
  } else if (!partial) {
    throw new Error('Titulo obrigatorio.');
  }

  if (body.notes !== undefined) {
    payload.notes = String(body.notes || '').trim();
  }

  if (body.status !== undefined) {
    if (!VALID_STATUSES.has(body.status)) {
      throw new Error('Status invalido.');
    }
    payload.status = body.status;
  } else if (body.completed !== undefined) {
    payload.status = body.completed ? 'done' : 'pending';
  }

  if (body.priority !== undefined) {
    if (!VALID_PRIORITIES.has(body.priority)) {
      throw new Error('Prioridade invalida.');
    }
    payload.priority = body.priority;
  }

  if (body.serviceDate !== undefined) {
    payload.serviceDate = body.serviceDate ? new Date(body.serviceDate) : null;
  }

  if (body.customerName !== undefined) {
    payload.customerName = String(body.customerName || '').trim();
  }

  if (body.customerPhone !== undefined) {
    payload.customerPhone = String(body.customerPhone || '').trim();
  }

  if (body.address !== undefined) {
    payload.address = String(body.address || '').trim();
  }

  if (body.checklistItems !== undefined) {
    payload.checklistItems = normalizeChecklistItems(body.checklistItems);
  }

  if (body.proofPhoto !== undefined) {
    payload.proofPhoto = normalizeProofPhoto(body.proofPhoto);
  }

  return payload;
}

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ serviceDate: 1, createdAt: -1 });
    return res.json(tasks.map(serializeTask));
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao carregar tarefas.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const payload = buildTaskPayload(req.body);
    const task = new Task({ ...payload, user: req.userId });
    await task.save();
    return res.status(201).json(serializeTask(task));
  } catch (error) {
    const statusCode = error.message.endsWith('obrigatorio.') || error.message.endsWith('invalida.') || error.message.endsWith('invalido.')
      ? 400
      : 500;

    return res.status(statusCode).json({ error: statusCode === 400 ? error.message : 'Erro ao criar tarefa.' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const payload = buildTaskPayload(req.body, { partial: true });
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      payload,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Tarefa nao encontrada.' });
    }

    return res.json(serializeTask(task));
  } catch (error) {
    const statusCode = error.message.endsWith('obrigatorio.') || error.message.endsWith('invalida.') || error.message.endsWith('invalido.')
      ? 400
      : 500;

    return res.status(statusCode).json({ error: statusCode === 400 ? error.message : 'Erro ao atualizar tarefa.' });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const payload = buildTaskPayload({ status: req.body.status, completed: req.body.completed }, { partial: true });
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      payload,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Tarefa nao encontrada.' });
    }

    return res.json(serializeTask(task));
  } catch (error) {
    const statusCode = error.message.endsWith('invalida.') || error.message.endsWith('invalido.') ? 400 : 500;
    return res.status(statusCode).json({ error: statusCode === 400 ? error.message : 'Erro ao atualizar status.' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ error: 'Tarefa nao encontrada.' });
    }

    return res.json({ message: 'Tarefa removida.' });
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao remover tarefa.' });
  }
});

module.exports = router;
