/* eslint-env node */
const bcrypt = require('bcryptjs');
const Task = require('../models/Task');
const User = require('../models/User');

function getDemoConfig() {
  return {
    enabled: process.env.DEMO_ACCOUNT_ENABLED === 'true',
    username: (process.env.DEMO_USERNAME || 'demo@taskflow.com').trim().toLowerCase(),
    password: process.env.DEMO_PASSWORD || 'taskflow123',
    fullName: (process.env.DEMO_FULL_NAME || 'Equipe Demo TaskFlow').trim(),
  };
}

function buildDemoTasks(userId) {
  return [
    {
      user: userId,
      title: 'Instalacao de cameras no cliente Silva',
      text: 'Instalacao de cameras no cliente Silva',
      customerName: 'Condominio Silva',
      customerPhone: '(11) 98888-1020',
      address: 'Rua das Palmeiras, 120 - Centro',
      assignedTechnician: 'Marina Costa',
      notes: 'Levar escada, furadeira e testar acesso remoto antes de concluir.',
      status: 'in_progress',
      priority: 'high',
      serviceDate: new Date(),
      checklistItems: [
        { label: 'Conferir pontos de energia', done: true },
        { label: 'Instalar cameras externas', done: false },
        { label: 'Validar visualizacao no celular do cliente', done: false },
      ],
    },
    {
      user: userId,
      title: 'Manutencao preventiva de ar-condicionado',
      text: 'Manutencao preventiva de ar-condicionado',
      customerName: 'Clinica Boa Vista',
      customerPhone: '(11) 97777-4411',
      address: 'Av. Brasil, 804 - Sala 32',
      assignedTechnician: 'Rafael Lima',
      notes: 'Atendimento precisa encerrar antes das 16h.',
      status: 'pending',
      priority: 'medium',
      serviceDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      checklistItems: [
        { label: 'Limpar filtros', done: false },
        { label: 'Verificar dreno', done: false },
        { label: 'Registrar foto do equipamento', done: false },
      ],
    },
    {
      user: userId,
      title: 'Vistoria de rede e roteador',
      text: 'Vistoria de rede e roteador',
      customerName: 'Mercado Norte',
      customerPhone: '(11) 96666-2200',
      address: 'Rua Sete, 45 - Vila Nova',
      assignedTechnician: 'Marina Costa',
      notes: 'Cliente relatou queda intermitente no caixa principal.',
      status: 'done',
      priority: 'low',
      serviceDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      checklistItems: [
        { label: 'Testar cabo do caixa', done: true },
        { label: 'Reiniciar roteador', done: true },
        { label: 'Orientar cliente sobre proximo chamado', done: true },
      ],
    },
  ];
}

async function ensureDemoAccount() {
  const config = getDemoConfig();
  if (!config.enabled) {
    return null;
  }

  if (!config.username || config.password.length < 6) {
    console.warn('Conta demo ignorada: configure DEMO_USERNAME e DEMO_PASSWORD com pelo menos 6 caracteres.');
    return null;
  }

  const passwordHash = await bcrypt.hash(config.password, 10);
  const user = await User.findOneAndUpdate(
    { username: config.username },
    {
      username: config.username,
      password: passwordHash,
      fullName: config.fullName,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const existingTasks = await Task.countDocuments({ user: user._id });
  if (existingTasks === 0) {
    await Task.insertMany(buildDemoTasks(user._id));
  }

  console.log(`Conta demo pronta: ${config.username}`);
  return user;
}

module.exports = ensureDemoAccount;
