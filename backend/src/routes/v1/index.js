/* eslint-env node */
const express = require('express');
const authRoutes = require('../auth');
const taskRoutes = require('../tasks');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'taskflow-api', version: 'v1' });
});

module.exports = router;
