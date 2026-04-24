/* eslint-env node */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const apiV1Routes = require('./routes/v1');
const ensureDemoAccount = require('./utils/demoSeed');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';
const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origem não permitida pelo CORS.'));
  },
}));
app.use(express.json({ limit: '6mb' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB conectado');
    await ensureDemoAccount();
  })
  .catch((error) => console.error('Erro ao conectar ao MongoDB:', error));

app.get('/', (req, res) => {
  res.send('API TaskFlow rodando!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'taskflow-api' });
});

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/api/v1', apiV1Routes);

app.use((error, req, res, next) => {
  if (error.message === 'Origem não permitida pelo CORS.') {
    return res.status(403).json({ error: error.message });
  }

  return next(error);
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} já está em uso. Encerre o outro processo ou altere PORT no .env.`);
    process.exit(1);
  }

  if (error.code === 'EPERM') {
    console.error(`Sem permissão para escutar em ${HOST}:${PORT}. Tente HOST=127.0.0.1 no backend/.env.`);
    process.exit(1);
  }

  console.error('Erro ao iniciar o servidor:', error);
  process.exit(1);
});
