import React, { useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiCreditCard,
  FiDownload,
  FiGrid,
  FiLogOut,
  FiMapPin,
  FiMoon,
  FiPlusSquare,
  FiSun,
  FiTrendingUp,
  FiUser,
} from 'react-icons/fi';
import AddTaskForm from './AddTaskForm';
import TaskList from './TaskList';
import Actions from './Actions';
import EmptyState from './EmptyState';
import ActivityFeed from './ActivityFeed';
import { createTask, deleteTask, downloadTasksCsv, fetchTasks, updateTask, updateTaskStatus } from '../services/tasks';
import { requestCheckoutIntent } from '../services/auth';
import { buildOrderPayload } from '../utils/orderForm';
import { PLAN_OPTIONS, getPlanById } from '../config/plans';

function buildSearchableText(task) {
  return [
    task.title,
    task.customerName,
    task.customerPhone,
    task.address,
    task.assignedTechnician,
    task.notes,
    ...(task.checklistItems || []).map((item) => item.label),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function formatDateLabel(dateValue) {
  if (!dateValue) {
    return 'Sem agenda';
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data inválida';
  }

  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(parsedDate);
}

function formatTimestamp(dateValue) {
  if (!dateValue) {
    return 'sem registro';
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'sem registro';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsedDate);
}

function calculateDaysRemaining(dateValue) {
  if (!dateValue) {
    return 0;
  }

  const remainingMs = new Date(dateValue).getTime() - Date.now();
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

function getLocalDate(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function matchesPeriod(task, periodFilter) {
  if (periodFilter === 'all') {
    return true;
  }

  if (!task.serviceDate) {
    return periodFilter === 'unscheduled';
  }

  const serviceDate = getLocalDate(task.serviceDate);
  if (Number.isNaN(serviceDate.getTime())) {
    return false;
  }

  const today = getLocalDate();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 6);

  if (periodFilter === 'today') {
    return serviceDate.getTime() === today.getTime();
  }

  if (periodFilter === 'week') {
    return serviceDate >= today && serviceDate <= weekEnd;
  }

  if (periodFilter === 'overdue') {
    return serviceDate < today && task.status !== 'done';
  }

  return true;
}

function deriveActivityItems(tasks) {
  return [...tasks]
    .sort((firstTask, secondTask) => {
      const secondDate = new Date(secondTask.updatedAt || secondTask.createdAt || secondTask.serviceDate || 0).getTime();
      const firstDate = new Date(firstTask.updatedAt || firstTask.createdAt || firstTask.serviceDate || 0).getTime();
      return secondDate - firstDate;
    })
    .slice(0, 8)
    .map((task) => {
      if (task.status === 'done') {
        return {
          id: `${task.id}-done`,
          type: 'concluded',
          text: `${task.title} foi concluída para ${task.customerName || 'cliente não informado'}.`,
          meta: `OS ${String(task.id).slice(-6).toUpperCase()} | encerramento`,
          timestamp: formatTimestamp(task.updatedAt || task.createdAt),
        };
      }

      if (task.status === 'in_progress') {
        return {
          id: `${task.id}-progress`,
          type: 'started',
          text: `${task.title} entrou em atendimento com ${task.customerName || 'cliente não informado'}.`,
          meta: `OS ${String(task.id).slice(-6).toUpperCase()} | em campo`,
          timestamp: formatTimestamp(task.updatedAt || task.createdAt),
        };
      }

      if (task.serviceDate) {
        return {
          id: `${task.id}-reminder`,
          type: 'reminder',
          text: `${task.title} está programada para ${formatDateLabel(task.serviceDate)}.`,
          meta: `${task.customerName || 'Cliente não informado'} | lembrete de agenda`,
          timestamp: formatTimestamp(task.serviceDate),
        };
      }

      return {
        id: `${task.id}-created`,
        type: 'created',
        text: `${task.title} foi criada e aguarda despacho operacional.`,
        meta: `${task.customerName || 'Cliente não informado'} | nova OS`,
        timestamp: formatTimestamp(task.createdAt),
      };
    });
}

function ThemeSwitch({ theme, onToggleTheme }) {
  return (
    <button type="button" className="theme-switch" onClick={onToggleTheme} aria-label="Alternar tema visual">
      {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
      <span className="theme-switch__label">{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
    </button>
  );
}

function TodoApp({ session, onLogout, onSessionUpdate, theme, onToggleTheme }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [technicianFilter, setTechnicianFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [checkoutPlan, setCheckoutPlan] = useState(session.user?.plan || 'team');
  const [checkoutContact, setCheckoutContact] = useState(session.user?.checkoutIntent?.contactValue || '');
  const [checkoutNotes, setCheckoutNotes] = useState(session.user?.checkoutIntent?.notes || '');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      setMessage('');

      try {
        const data = await fetchTasks(session.token);
        setTasks(data);
      } catch (error) {
        setMessage(error.message || 'Erro ao carregar ordens de serviço.');
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [session.token]);

  const addTask = async (payload) => {
    if (!payload.title.trim() || !payload.customerName.trim()) {
      setMessage('Preencha pelo menos o título e o cliente da ordem.');
      return null;
    }

    setMessage('');

    try {
      const createdTask = await createTask(session.token, payload);
      setTasks((currentTasks) => [createdTask, ...currentTasks]);
      setMessage('Ordem de serviço adicionada com sucesso.');
      return createdTask;
    } catch (error) {
      setMessage(error.message);
      return null;
    }
  };

  const saveTaskEdits = async (payload, currentTask) => {
    if (!currentTask?.id) {
      return addTask(payload);
    }

    try {
      const updatedTask = await updateTask(session.token, currentTask.id, payload);
      setTasks((currentTasks) => currentTasks.map((item) => (item.id === currentTask.id ? updatedTask : item)));
      setEditingTask(null);
      setMessage('Ordem atualizada com sucesso.');
      return updatedTask;
    } catch (error) {
      setMessage(error.message);
      return null;
    }
  };

  const startEditingTask = (task) => {
    setEditingTask(task);
    setActiveSection('new-order');
    setMessage(`Editando ordem de ${task.customerName || task.title}.`);
    requestAnimationFrame(() => {
      document.getElementById('section-new-order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const cancelEditingTask = () => {
    setEditingTask(null);
    setMessage('Edição cancelada.');
  };

  const changeTaskStatus = async (taskId, nextStatus) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === nextStatus) {
      return;
    }

    try {
      const updatedTask = await updateTaskStatus(session.token, taskId, {
        status: nextStatus,
      });

      setTasks((currentTasks) => currentTasks.map((item) => (item.id === taskId ? updatedTask : item)));
      if (editingTask?.id === taskId) {
        setEditingTask(updatedTask);
      }
      setMessage(`Status atualizado para ${nextStatus === 'done' ? 'concluído' : nextStatus === 'in_progress' ? 'em andamento' : 'pendente'}.`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const toggleChecklistItem = async (task, checklistItemId) => {
    const updatedChecklistItems = task.checklistItems.map((item) => (
      item.id === checklistItemId
        ? { ...item, done: !item.done }
        : item
    ));

    try {
      const updatedTask = await updateTask(session.token, task.id, buildOrderPayload({
        ...task,
        serviceDate: task.serviceDate ? String(task.serviceDate).slice(0, 10) : '',
        checklistItems: updatedChecklistItems,
      }));

      setTasks((currentTasks) => currentTasks.map((item) => (item.id === task.id ? updatedTask : item)));
      if (editingTask?.id === task.id) {
        setEditingTask(updatedTask);
      }
      setMessage('Checklist atualizado.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const removeTask = async (taskId) => {
    try {
      await deleteTask(session.token, taskId);
      setTasks((currentTasks) => currentTasks.filter((item) => item.id !== taskId));
      if (editingTask?.id === taskId) {
        setEditingTask(null);
      }
      setMessage('Ordem removida.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const clearCompleted = async () => {
    const completedTasksList = tasks.filter((task) => task.status === 'done');
    await Promise.all(completedTasksList.map((task) => deleteTask(session.token, task.id)));
    setTasks((currentTasks) => currentTasks.filter((task) => task.status !== 'done'));
    if (editingTask?.status === 'done') {
      setEditingTask(null);
    }
    setMessage('Ordens concluídas removidas.');
  };

  const handleCheckoutIntent = async (event) => {
    event.preventDefault();

    if (!checkoutContact.trim()) {
      setMessage('Informe um WhatsApp ou contato para solicitar a assinatura.');
      return;
    }

    setCheckoutLoading(true);
    setMessage('');

    try {
      const response = await requestCheckoutIntent(session.token, {
        requestedPlan: checkoutPlan,
        contactMethod: 'whatsapp',
        contactValue: checkoutContact,
        notes: checkoutNotes,
      });

      onSessionUpdate({ user: response.user });
      setMessage(response.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const reportBlob = await downloadTasksCsv(session.token);
      const reportUrl = URL.createObjectURL(reportBlob);
      const reportLink = document.createElement('a');
      const dateStamp = new Date().toISOString().slice(0, 10);

      reportLink.href = reportUrl;
      reportLink.download = `taskflow-ordens-${dateStamp}.csv`;
      document.body.appendChild(reportLink);
      reportLink.click();
      reportLink.remove();
      URL.revokeObjectURL(reportUrl);
      setMessage('Relatório CSV exportado com sucesso.');
    } catch (error) {
      setMessage(error.message || 'Erro ao exportar relatório.');
    }
  };

  const technicianOptions = useMemo(() => {
    return [...new Set(tasks.map((task) => task.assignedTechnician).filter(Boolean))]
      .sort((firstName, secondName) => firstName.localeCompare(secondName, 'pt-BR'));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === 'active') return task.status === 'pending';
        if (filter === 'in_progress') return task.status === 'in_progress';
        if (filter === 'completed') return task.status === 'done';
        return true;
      })
      .filter((task) => (priorityFilter === 'all' ? true : task.priority === priorityFilter))
      .filter((task) => (technicianFilter === 'all' ? true : task.assignedTechnician === technicianFilter))
      .filter((task) => matchesPeriod(task, periodFilter))
      .filter((task) => buildSearchableText(task).includes(search.toLowerCase()));
  }, [filter, periodFilter, priorityFilter, search, tasks, technicianFilter]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'done').length;
  const pendingTasks = tasks.filter((task) => task.status === 'pending').length;
  const inProgressTasks = tasks.filter((task) => task.status === 'in_progress').length;
  const overdueTasks = tasks.filter((task) => matchesPeriod(task, 'overdue')).length;
  const todayTasks = tasks.filter((task) => matchesPeriod(task, 'today')).length;
  const scheduledThisWeekTasks = tasks.filter((task) => matchesPeriod(task, 'week')).length;
  const highPriorityTasks = tasks.filter((task) => task.priority === 'high' && task.status !== 'done').length;
  const activityItems = useMemo(() => deriveActivityItems(tasks), [tasks]);
  const nextOrder = useMemo(() => {
    return [...tasks]
      .filter((task) => task.serviceDate)
      .sort((firstTask, secondTask) => new Date(firstTask.serviceDate) - new Date(secondTask.serviceDate))[0] || null;
  }, [tasks]);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const currentUser = session.user || {};
  const currentPlan = getPlanById(currentUser.plan);
  const trialDaysRemaining = currentUser.trialDaysRemaining ?? calculateDaysRemaining(currentUser.trialEndsAt);
  const trialExpired = Boolean(currentUser.trialExpired) || (trialDaysRemaining === 0 && currentUser.subscriptionStatus === 'trialing');
  const hasChecklist = tasks.some((task) => task.checklistItems?.length > 0);
  const hasTechnician = tasks.some((task) => task.assignedTechnician);
  const hasScheduledOrder = tasks.some((task) => task.serviceDate);
  const activationGoals = [
    { label: 'Primeira OS criada', done: totalTasks > 0 },
    { label: 'Checklist configurado', done: hasChecklist },
    { label: 'Técnico responsável definido', done: hasTechnician },
    { label: 'Agenda com data real', done: hasScheduledOrder },
  ];
  const activationScore = Math.round((activationGoals.filter((goal) => goal.done).length / activationGoals.length) * 100);
  const checkoutStatusLabel = currentUser.commercialStageLabel || (
    currentUser.subscriptionStatus === 'checkout_requested'
      ? 'Assinatura solicitada'
      : currentUser.subscriptionStatus === 'active'
        ? 'Assinatura ativa'
        : trialExpired ? 'Trial expirado' : 'Trial ativo'
  );
  const checkoutRequested = currentUser.subscriptionStatus === 'checkout_requested';
  const checkoutRequestedAt = currentUser.checkoutIntent?.requestedAt
    ? formatTimestamp(currentUser.checkoutIntent.requestedAt)
    : null;
  const revenueReadiness = activationScore >= 75 && totalTasks >= 3
    ? 'Pronto para cobrança'
    : activationScore >= 50
      ? 'Validando valor'
      : 'Ativação inicial';
  const commercialNotice = checkoutRequested
    ? {
      title: 'Assinatura solicitada',
      body: `Contato registrado${currentUser.checkoutIntent?.contactValue ? `: ${currentUser.checkoutIntent.contactValue}` : ''}. A equipe comercial pode seguir com a cobrança assistida.`,
      tone: 'success',
    }
    : trialExpired
      ? {
        title: 'Trial encerrado',
        body: 'A conta já passou do período gratuito. Solicite assinatura para transformar este uso em receita.',
        tone: 'warning',
      }
      : {
        title: `${trialDaysRemaining} dia(s) de trial restantes`,
        body: 'Use este período para provar valor: criar OS real, concluir checklist, atribuir técnico e exportar relatório.',
        tone: 'default',
      };
  const operationalSignal = overdueTasks > 0
    ? {
      tone: 'danger',
      label: 'Atenção imediata',
      title: `${overdueTasks} OS atrasada${overdueTasks > 1 ? 's' : ''}`,
      body: 'Priorize reagendamento, contato com cliente e conclusão do checklist pendente.',
    }
    : inProgressTasks > 0
      ? {
        tone: 'active',
        label: 'Operação em campo',
        title: `${inProgressTasks} atendimento${inProgressTasks > 1 ? 's' : ''} em rota`,
        body: 'Acompanhe execução, checklist e possíveis bloqueios antes do encerramento.',
      }
      : pendingTasks > 0
        ? {
          tone: 'warning',
          label: 'Próximo movimento',
          title: `${pendingTasks} OS aguardando despacho`,
          body: 'Atribua técnico e agenda para tirar a fila do estado parado.',
        }
        : {
          tone: 'success',
          label: 'Carteira estável',
          title: 'Sem fila crítica agora',
          body: 'A operação está limpa. Bom momento para revisar agenda, relatório e receita.',
        };
  const dashboardMetrics = [
    {
      key: 'total',
      label: 'Carteira',
      value: totalTasks,
      note: 'ordens cadastradas',
      tone: 'blue',
      filterKey: 'all',
    },
    {
      key: 'pending',
      label: 'Aguardando',
      value: pendingTasks,
      note: 'precisam de despacho',
      tone: 'amber',
      filterKey: 'active',
    },
    {
      key: 'progress',
      label: 'Em campo',
      value: inProgressTasks,
      note: 'em atendimento',
      tone: 'orange',
      filterKey: 'in_progress',
    },
    {
      key: 'done',
      label: 'Concluídas',
      value: completedTasks,
      note: `${completionRate}% de fechamento`,
      tone: 'green',
      filterKey: 'completed',
    },
  ];
  const focusItems = [
    {
      icon: FiAlertTriangle,
      label: 'Risco',
      value: overdueTasks,
      text: overdueTasks > 0 ? 'ordens atrasadas pedem ação' : 'sem atraso crítico',
      tone: overdueTasks > 0 ? 'danger' : 'success',
    },
    {
      icon: FiClock,
      label: 'Hoje',
      value: todayTasks,
      text: todayTasks > 0 ? 'visitas previstas para hoje' : 'nenhuma visita marcada hoje',
      tone: 'blue',
    },
    {
      icon: FiAlertTriangle,
      label: 'Prioridade',
      value: highPriorityTasks,
      text: highPriorityTasks > 0 ? 'serviços de alta prioridade abertos' : 'sem alta prioridade aberta',
      tone: highPriorityTasks > 0 ? 'danger' : 'success',
    },
    {
      icon: FiTrendingUp,
      label: 'Semana',
      value: scheduledThisWeekTasks,
      text: 'visitas nos próximos 7 dias',
      tone: 'amber',
    },
    {
      icon: FiCheckCircle,
      label: 'Ativação',
      value: `${activationScore}%`,
      text: revenueReadiness,
      tone: activationScore >= 75 ? 'success' : 'orange',
    },
  ];
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', mobileLabel: 'Dash', icon: FiGrid, badge: String(totalTasks || 0) },
    { id: 'new-order', label: 'Nova OS', mobileLabel: 'Nova', icon: FiPlusSquare },
    { id: 'orders', label: 'Ordens', icon: FiClipboard, badge: String(filteredTasks.length || 0) },
    { id: 'activity', label: 'Atividade', mobileLabel: 'Ativ.', icon: FiActivity, badge: String(activityItems.length || 0) },
    { id: 'account', label: 'Conta', icon: FiUser },
  ];

  const pageTitles = {
    dashboard: 'Dashboard operacional',
    'new-order': editingTask ? 'Editar ordem de serviço' : 'Nova ordem de serviço',
    orders: 'Fila de serviços',
    activity: 'Atividade recente',
    account: 'Conta e preferências',
  };

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderNavButton = (item, mobile = false) => {
    const Icon = item.icon;
    const buttonClassName = mobile
      ? `mobile-nav__button ${activeSection === item.id ? 'is-active' : ''}`
      : `sidebar-nav__button ${activeSection === item.id ? 'is-active' : ''}`;

    return (
      <button key={item.id} type="button" className={buttonClassName} onClick={() => handleNavigate(item.id)}>
        {mobile ? (
          <>
            <Icon className="mobile-nav__icon" />
            <span className="mobile-nav__label">{item.mobileLabel || item.label}</span>
          </>
        ) : (
          <>
            <span className="nav-button__main">
              <Icon className="nav-button__icon" />
              <span className="nav-button__label">{item.label}</span>
            </span>
            {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
          </>
        )}
      </button>
    );
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="logo-stack">
          <div className="brand-mark">
            <span className="brand-mark__task">Task</span>
            <span className="brand-mark__flow">Flow</span>
          </div>
          <span className="brand-subtitle">Field operations</span>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          {navItems.map((item) => renderNavButton(item))}
        </nav>

        <div className="app-sidebar__footer">
          <div className="user-mini">
            <span className="user-mini__avatar" style={{ background: 'linear-gradient(135deg, #f5a623, #ff6b35)' }}>
              {String(session.user?.username || 'TF').slice(0, 2).toUpperCase()}
            </span>
            <div>
              <span className="user-mini__name">{session.user?.username}</span>
              <span className="user-mini__role">Operação conectada</span>
            </div>
          </div>

          <ThemeSwitch theme={theme} onToggleTheme={onToggleTheme} />

          <button type="button" className="button-ghost" onClick={onLogout}>
            <FiLogOut size={15} />
            Encerrar sessão
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <div className="topbar-logo">
            <div className="brand-mark brand-mark--compact">
              <span className="brand-mark__task">Task</span>
              <span className="brand-mark__flow">Flow</span>
            </div>
          </div>

          <div className="page-intro">
            <span className="section-kicker">TaskFlow Field</span>
            <h1 className="page-title">{pageTitles[activeSection] || pageTitles.dashboard}</h1>
            <p className="page-description">
              Painel de despacho, cadastro e acompanhamento visual para equipes pequenas de campo operarem sem planilha improvisada.
            </p>
          </div>

          <div className="topbar-actions">
            <ThemeSwitch theme={theme} onToggleTheme={onToggleTheme} />
            <button type="button" className="button-ghost" onClick={onLogout}>
              <FiLogOut size={15} />
              Sair
            </button>
            <button type="button" className="button-ghost" onClick={handleExportReport}>
              <FiDownload size={15} />
              Exportar CSV
            </button>
            <button type="button" className="button-primary" onClick={() => handleNavigate('new-order')}>
              <FiPlusSquare size={15} />
              Nova OS
            </button>
          </div>
        </header>

        <div className="app-content">
          {message ? (
            <div className="notice-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="notice-banner__dot" />
                <span>{message}</span>
              </div>
              <span className="brand-subtitle">Operação atualizada</span>
            </div>
          ) : null}

          <section id="section-dashboard" className="dashboard-pro">
            <div className="dashboard-command">
              <div className="dashboard-command__copy">
                <span className="dashboard-eyebrow">Centro de controle</span>
                <h2 className="dashboard-command__title">Operação em foco.</h2>
                <p className="dashboard-command__description">
                  Resumo executivo da carteira, com o próximo movimento claro e atalhos para agir no fluxo de campo.
                </p>
                <div className="dashboard-command__actions">
                  <button type="button" className="button-primary" onClick={() => handleNavigate('new-order')}>
                    <FiPlusSquare size={16} />
                    Criar OS
                  </button>
                  <button type="button" className="button-ghost" onClick={() => handleNavigate('orders')}>
                    <FiClipboard size={16} />
                    Ver fila
                  </button>
                </div>
              </div>

              <aside className={`dashboard-signal dashboard-signal--${operationalSignal.tone}`}>
                <span className="dashboard-signal__label">{operationalSignal.label}</span>
                <strong className="dashboard-signal__title">{operationalSignal.title}</strong>
                <span className="dashboard-signal__body">{operationalSignal.body}</span>
              </aside>
            </div>

            <div className="metric-board" aria-label="Indicadores principais">
              {dashboardMetrics.map((metric) => (
                <button
                  key={metric.key}
                  type="button"
                  className={`metric-card metric-card--${metric.tone} ${filter === metric.filterKey ? 'is-active' : ''}`}
                  onClick={() => setFilter(metric.filterKey)}
                >
                  <span className="metric-card__label">{metric.label}</span>
                  <strong className="metric-card__value">{metric.value}</strong>
                  <span className="metric-card__note">{metric.note}</span>
                </button>
              ))}
            </div>

            <div className="ops-overview">
              <div className="ops-panel ops-panel--focus">
                <div className="ops-panel__header">
                  <div>
                    <span className="dashboard-eyebrow">Foco do dia</span>
                    <h3>O que merece atenção agora</h3>
                  </div>
                  <span className="ops-panel__badge">{revenueReadiness}</span>
                </div>

                <div className="focus-list">
                  {focusItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className={`focus-row focus-row--${item.tone}`}>
                        <span className="focus-row__icon"><Icon size={18} /></span>
                        <span className="focus-row__content">
                          <span className="focus-row__label">{item.label}</span>
                          <strong>{item.value}</strong>
                          <span>{item.text}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ops-panel">
                <div className="ops-panel__header">
                  <div>
                    <span className="dashboard-eyebrow">Agenda</span>
                    <h3>Próxima visita</h3>
                  </div>
                  <FiMapPin className="ops-panel__icon" size={22} />
                </div>

                {nextOrder ? (
                  <div className="next-visit-card">
                    <span className="next-visit-card__status">OS prioritária</span>
                    <h4>{nextOrder.title}</h4>
                    <div className="next-visit-card__meta">
                      <span>{nextOrder.customerName || 'Cliente não informado'}</span>
                      <span>{formatDateLabel(nextOrder.serviceDate)}</span>
                      <span>{nextOrder.assignedTechnician || 'Técnico pendente'}</span>
                      <span>{nextOrder.address || 'Endereço pendente'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="next-visit-empty">
                    <strong>Nenhuma visita agendada</strong>
                    <span>Cadastre data e técnico em uma OS para o radar operacional ficar ativo.</span>
                  </div>
                )}
              </div>

              <div className="ops-panel ops-panel--revenue">
                <div className="ops-panel__header">
                  <div>
                    <span className="dashboard-eyebrow">Receita</span>
                    <h3>{commercialNotice.title}</h3>
                  </div>
                  <FiCreditCard className="ops-panel__icon" size={22} />
                </div>
                <p>{commercialNotice.body}</p>
                <div className="activation-meter" aria-label={`Ativação em ${activationScore}%`}>
                  <span style={{ width: `${activationScore}%` }} />
                </div>
                <button type="button" className="button-ghost" onClick={() => handleNavigate('account')}>
                  Ver planos
                </button>
              </div>
            </div>
          </section>

          <div className="dual-grid">
            <section id="section-new-order" className="page-section">
              <AddTaskForm
                initialTask={editingTask}
                onSubmitTask={saveTaskEdits}
                onCancelEdit={cancelEditingTask}
              />
            </section>

            <section id="section-activity" className="page-section">
              <ActivityFeed items={activityItems} />
            </section>
          </div>

          <section id="section-orders" className="page-section">
            <div className="panel panel--padded">
              <div className="section-header">
                <div>
                  <span className="section-kicker">Serviço</span>
                  <h2 className="section-title">Lista de ordens</h2>
                  <p className="section-description">Quadro principal com busca, status, técnico, prioridade, agenda, checklist e ações para operar as OS de ponta a ponta.</p>
                </div>
                <button type="button" className="button-ghost" onClick={handleExportReport}>
                  <FiDownload size={15} />
                  Exportar relatório
                </button>
              </div>

              <div className="search-bar">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por serviço, cliente, endereço, técnico, telefone ou checklist..."
                  className="search-input"
                />
                <button type="button" className="button-ghost" onClick={() => setSearch('')}>
                  Limpar busca
                </button>
              </div>

              <div className="advanced-filter-grid">
                <label className="filter-field">
                  <span>Status</span>
                  <select value={filter} onChange={(event) => setFilter(event.target.value)} className="select">
                    <option value="all">Todos</option>
                    <option value="active">Pendentes</option>
                    <option value="in_progress">Em andamento</option>
                    <option value="completed">Concluídas</option>
                  </select>
                </label>

                <label className="filter-field">
                  <span>Prioridade</span>
                  <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="select">
                    <option value="all">Todas</option>
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </label>

                <label className="filter-field">
                  <span>Período</span>
                  <select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)} className="select">
                    <option value="all">Qualquer data</option>
                    <option value="today">Hoje</option>
                    <option value="week">Próximos 7 dias</option>
                    <option value="overdue">Atrasadas</option>
                    <option value="unscheduled">Sem agenda</option>
                  </select>
                </label>

                <label className="filter-field">
                  <span>Técnico</span>
                  <select value={technicianFilter} onChange={(event) => setTechnicianFilter(event.target.value)} className="select">
                    <option value="all">Todos</option>
                    {technicianOptions.map((technician) => (
                      <option key={technician} value={technician}>{technician}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {loading ? (
              <div className="panel panel--padded">
                <div className="note-box__body">Carregando quadro operacional...</div>
              </div>
            ) : totalTasks === 0 ? (
              <EmptyState />
            ) : filteredTasks.length === 0 ? (
              <EmptyState
                title="Nenhum resultado encontrado"
                description="Tente ajustar a busca ou trocar o filtro para localizar a ordem desejada."
              />
            ) : (
              <>
                <TaskList
                  tasks={filteredTasks}
                  technicianName={session.user?.username}
                  onStatusChange={changeTaskStatus}
                  onChecklistToggle={toggleChecklistItem}
                  onEditTask={startEditingTask}
                  onDeleteTask={removeTask}
                />
                <Actions completedTasks={completedTasks} totalTasks={totalTasks} onClearCompleted={clearCompleted} />
              </>
            )}
          </section>

          <section id="section-account" className="page-section">
            <div className="account-grid">
              <div className="panel panel--padded">
                <div className="section-header">
                  <div>
                    <span className="section-kicker">Conta</span>
                    <h2 className="section-title">Preferências de operação</h2>
                    <p className="section-description">Estado da sessão atual e preferências visuais para o uso diário do produto.</p>
                  </div>
                </div>

                <div className="spotlight-grid">
                  <div className="spotlight-item">
                    <span className="spotlight-label">Usuário</span>
                    <span className="spotlight-value">{session.user?.username}</span>
                    <span className="spotlight-note">Conta autenticada no painel web.</span>
                  </div>
                  <div className="spotlight-item">
                    <span className="spotlight-label">Tema</span>
                    <span className="spotlight-value">{theme === 'dark' ? 'Escuro' : 'Claro'}</span>
                    <span className="spotlight-note">Alternância persistida entre acessos.</span>
                  </div>
                  <div className="spotlight-item">
                    <span className="spotlight-label">API</span>
                    <span className="spotlight-value">Painel + app</span>
                    <span className="spotlight-note">Dados sincronizados para gestão e execução em campo.</span>
                  </div>
                  <div className="spotlight-item">
                    <span className="spotlight-label">Plano</span>
                    <span className="spotlight-value">{currentPlan.name}</span>
                    <span className="spotlight-note">
                      {checkoutStatusLabel}
                      {checkoutRequestedAt ? ` em ${checkoutRequestedAt}.` : ` com ${trialDaysRemaining} dia(s) restantes.`}
                    </span>
                  </div>
                  <div className="spotlight-item">
                    <span className="spotlight-label">Receita</span>
                    <span className="spotlight-value">{revenueReadiness}</span>
                    <span className="spotlight-note">Combina ativação, volume de OS e etapa comercial da conta.</span>
                  </div>
                  <div className="spotlight-item">
                    <span className="spotlight-label">Contato comercial</span>
                    <span className="spotlight-value">{currentUser.checkoutIntent?.contactValue || 'Pendente'}</span>
                    <span className="spotlight-note">Obrigatório para transformar intenção em venda assistida.</span>
                  </div>
                </div>
              </div>

              <div className="panel panel--padded">
                <div className="section-header">
                  <div>
                    <span className="section-kicker">Receita</span>
                    <h2 className="section-title">Trial e assinatura</h2>
                    <p className="section-description">Planos comerciais para demonstrar valor, registrar intenção de compra e conduzir a venda assistida.</p>
                  </div>
                </div>

                <form className="checkout-panel" onSubmit={handleCheckoutIntent}>
                  <div className="pricing-grid pricing-grid--account">
                    {PLAN_OPTIONS.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        className={`plan-card plan-card--button ${plan.featured ? 'is-featured' : ''} ${checkoutPlan === plan.id ? 'is-selected' : ''}`}
                        onClick={() => setCheckoutPlan(plan.id)}
                      >
                        <span className="plan-card__eyebrow">{plan.limit}</span>
                        <span className="plan-card__name">{plan.name}</span>
                        <span className="plan-card__price">{plan.price}</span>
                        <span className="plan-card__description">{plan.description}</span>
                      </button>
                    ))}
                  </div>

                  <div className="form-grid">
                    <label className="form-field">
                      <span className="field-label">WhatsApp para checkout</span>
                      <input
                        type="tel"
                        value={checkoutContact}
                        onChange={(event) => setCheckoutContact(event.target.value)}
                        placeholder="(11) 99999-9999"
                        className="input"
                        required
                      />
                    </label>
                    <label className="form-field">
                      <span className="field-label">Observação comercial</span>
                      <input
                        type="text"
                        value={checkoutNotes}
                        onChange={(event) => setCheckoutNotes(event.target.value)}
                        placeholder="Ex.: validar com equipe de 3 técnicos"
                        className="input"
                      />
                    </label>
                  </div>

                  <button type="submit" className="button-primary" disabled={checkoutLoading}>
                    <FiCreditCard size={15} />
                    {checkoutLoading ? 'Registrando...' : checkoutRequested ? 'Atualizar intenção de assinatura' : 'Registrar intenção de assinatura'}
                  </button>
                </form>
              </div>
            </div>

            <div className="panel panel--padded">
              <div className="section-header">
                <div>
                  <span className="section-kicker">Métricas</span>
                  <h2 className="section-title">Ativação e retenção</h2>
                  <p className="section-description">Indicadores práticos para saber se uma equipe entendeu valor antes de pedir pagamento.</p>
                </div>
                <button type="button" className="button-ghost" onClick={handleExportReport}>
                  <FiDownload size={15} />
                  Baixar CSV
                </button>
              </div>

              <div className="activation-grid">
                <div className="activation-score">
                  <span className="spotlight-label">Ativação</span>
                  <span className="spotlight-value">{activationScore}%</span>
                  <span className="spotlight-note">Meta: primeira ordem útil cadastrada em até 10 minutos.</span>
                </div>
                <div className="activation-list">
                  {activationGoals.map((goal) => (
                    <div key={goal.label} className={`activation-item ${goal.done ? 'is-done' : ''}`}>
                      <FiCheckCircle size={16} />
                      <span>{goal.label}</span>
                    </div>
                  ))}
                </div>
                <div className="metric-stack">
                  <div>
                    <span className="spotlight-label">Ordens por usuário</span>
                    <span className="spotlight-value">{totalTasks}</span>
                  </div>
                  <div>
                    <span className="spotlight-label">Conclusões</span>
                    <span className="spotlight-value">{completedTasks}</span>
                  </div>
                  <div>
                    <span className="spotlight-label">Retorno esperado</span>
                    <span className="spotlight-value">{scheduledThisWeekTasks}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Navegação inferior">
        {navItems.map((item) => renderNavButton(item, true))}
      </nav>
    </div>
  );
}

export default TodoApp;
