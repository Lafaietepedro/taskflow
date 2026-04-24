import React, { useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiClipboard,
  FiGrid,
  FiLogOut,
  FiMoon,
  FiPlusSquare,
  FiSun,
  FiUser,
} from 'react-icons/fi';
import AddTaskForm from './AddTaskForm';
import TaskStats from './TaskStats';
import TaskList from './TaskList';
import Actions from './Actions';
import EmptyState from './EmptyState';
import ActivityFeed from './ActivityFeed';
import { createTask, deleteTask, fetchTasks, updateTask, updateTaskStatus } from '../services/tasks';
import { buildOrderPayload } from '../utils/orderForm';

function buildSearchableText(task) {
  return [
    task.title,
    task.customerName,
    task.customerPhone,
    task.address,
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
    return 'Data invalida';
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
          text: `${task.title} foi concluida para ${task.customerName || 'cliente nao informado'}.`,
          meta: `OS ${String(task.id).slice(-6).toUpperCase()} | encerramento`,
          timestamp: formatTimestamp(task.updatedAt || task.createdAt),
        };
      }

      if (task.status === 'in_progress') {
        return {
          id: `${task.id}-progress`,
          type: 'started',
          text: `${task.title} entrou em atendimento com ${task.customerName || 'cliente nao informado'}.`,
          meta: `OS ${String(task.id).slice(-6).toUpperCase()} | em campo`,
          timestamp: formatTimestamp(task.updatedAt || task.createdAt),
        };
      }

      if (task.serviceDate) {
        return {
          id: `${task.id}-reminder`,
          type: 'reminder',
          text: `${task.title} esta programada para ${formatDateLabel(task.serviceDate)}.`,
          meta: `${task.customerName || 'Cliente nao informado'} | lembrete de agenda`,
          timestamp: formatTimestamp(task.serviceDate),
        };
      }

      return {
        id: `${task.id}-created`,
        type: 'created',
        text: `${task.title} foi criada e aguarda despacho operacional.`,
        meta: `${task.customerName || 'Cliente nao informado'} | nova OS`,
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

function TodoApp({ session, onLogout, theme, onToggleTheme }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      setMessage('');

      try {
        const data = await fetchTasks(session.token);
        setTasks(data);
      } catch (error) {
        setMessage(error.message || 'Erro ao carregar ordens de servico.');
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [session.token]);

  const addTask = async (payload) => {
    if (!payload.title.trim() || !payload.customerName.trim()) {
      setMessage('Preencha pelo menos o titulo e o cliente da ordem.');
      return null;
    }

    setMessage('');

    try {
      const createdTask = await createTask(session.token, payload);
      setTasks((currentTasks) => [createdTask, ...currentTasks]);
      setMessage('Ordem de servico adicionada com sucesso.');
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
    setMessage('Edicao cancelada.');
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
      setMessage(`Status atualizado para ${nextStatus === 'done' ? 'concluido' : nextStatus === 'in_progress' ? 'em andamento' : 'pendente'}.`);
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
    setMessage('Ordens concluidas removidas.');
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === 'active') return task.status === 'pending';
        if (filter === 'in_progress') return task.status === 'in_progress';
        if (filter === 'completed') return task.status === 'done';
        return true;
      })
      .filter((task) => buildSearchableText(task).includes(search.toLowerCase()));
  }, [filter, search, tasks]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'done').length;
  const pendingTasks = tasks.filter((task) => task.status === 'pending').length;
  const inProgressTasks = tasks.filter((task) => task.status === 'in_progress').length;
  const activityItems = useMemo(() => deriveActivityItems(tasks), [tasks]);
  const nextOrder = useMemo(() => {
    return [...tasks]
      .filter((task) => task.serviceDate)
      .sort((firstTask, secondTask) => new Date(firstTask.serviceDate) - new Date(secondTask.serviceDate))[0] || null;
  }, [tasks]);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid, badge: String(totalTasks || 0) },
    { id: 'new-order', label: 'Nova OS', icon: FiPlusSquare },
    { id: 'orders', label: 'Ordens', icon: FiClipboard, badge: String(filteredTasks.length || 0) },
    { id: 'activity', label: 'Atividade', icon: FiActivity, badge: String(activityItems.length || 0) },
    { id: 'account', label: 'Conta', icon: FiUser },
  ];

  const pageTitles = {
    dashboard: 'Dashboard operacional',
    'new-order': editingTask ? 'Editar ordem de servico' : 'Nova ordem de servico',
    orders: 'Fila de servicos',
    activity: 'Atividade recente',
    account: 'Conta e preferencias',
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
            <span className="mobile-nav__label">{item.label}</span>
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
          <div className="brand-mark" style={{ fontSize: '1.8rem' }}>
            <span className="brand-mark__task">Task</span>
            <span className="brand-mark__flow">Flow</span>
          </div>
          <span className="brand-subtitle">Field operations</span>
        </div>

        <nav className="sidebar-nav" aria-label="Navegacao principal">
          {navItems.map((item) => renderNavButton(item))}
        </nav>

        <div className="app-sidebar__footer">
          <div className="user-mini">
            <span className="user-mini__avatar" style={{ background: 'linear-gradient(135deg, #f5a623, #ff6b35)' }}>
              {String(session.user?.username || 'TF').slice(0, 2).toUpperCase()}
            </span>
            <div>
              <span className="user-mini__name">{session.user?.username}</span>
              <span className="user-mini__role">Operacao conectada</span>
            </div>
          </div>

          <ThemeSwitch theme={theme} onToggleTheme={onToggleTheme} />

          <button type="button" className="button-ghost" onClick={onLogout}>
            <FiLogOut size={15} />
            Encerrar sessao
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <div className="topbar-logo">
            <div className="brand-mark" style={{ fontSize: '1.4rem' }}>
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
              <span className="brand-subtitle">Operacao atualizada</span>
            </div>
          ) : null}

          <section id="section-dashboard" className="page-section">
            <div className="section-header">
              <div>
                <span className="section-kicker">Visao geral</span>
                <h2 className="section-title">Dashboard e ritmo operacional</h2>
                <p className="section-description">KPIs com leitura rapida para o dono da operacao e um resumo direto do que esta puxando o dia.</p>
              </div>
            </div>

            <TaskStats
              totalTasks={totalTasks}
              pendingTasks={pendingTasks}
              inProgressTasks={inProgressTasks}
              completedTasks={completedTasks}
              filter={filter}
              setFilter={setFilter}
            />

            <div className="dashboard-grid">
              <div className="panel panel--padded">
                <div className="section-header">
                  <div>
                    <span className="panel-kicker">Despacho</span>
                    <h3 className="panel-title">Leitura tatica do quadro</h3>
                    <p className="panel-description">Um resumo do momento para decidir o que priorizar, cobrar ou deslocar.</p>
                  </div>
                </div>

                <div className="spotlight-grid">
                  <div className="spotlight-item">
                    <span className="spotlight-label">Conclusao</span>
                    <span className="spotlight-value">{completionRate}%</span>
                    <span className="spotlight-note">Taxa atual de fechamento da carteira.</span>
                  </div>
                  <div className="spotlight-item">
                    <span className="spotlight-label">Fila critica</span>
                    <span className="spotlight-value">{pendingTasks}</span>
                    <span className="spotlight-note">Ordens paradas aguardando movimento.</span>
                  </div>
                  <div className="spotlight-item">
                    <span className="spotlight-label">Equipe em rota</span>
                    <span className="spotlight-value">{inProgressTasks}</span>
                    <span className="spotlight-note">Atendimentos ja em campo neste momento.</span>
                  </div>
                </div>
              </div>

              <div className="panel panel--padded">
                <div className="section-header">
                  <div>
                    <span className="panel-kicker">Proxima visita</span>
                    <h3 className="panel-title">Radar de agenda</h3>
                    <p className="panel-description">O que vem primeiro no cronograma e merece contexto pronto no painel.</p>
                  </div>
                </div>

                {nextOrder ? (
                  <div className="spotlight-banner">
                    <span className="spotlight-banner__label">OS prioritaria</span>
                    <h4 className="spotlight-banner__title">{nextOrder.title}</h4>
                    <div className="spotlight-banner__meta">
                      <span>{nextOrder.customerName || 'Cliente nao informado'}</span>
                      <span>{formatDateLabel(nextOrder.serviceDate)}</span>
                      <span>{nextOrder.address || 'Endereco pendente'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="note-box__body">Ainda nao ha visitas com data definida para destacar no radar.</div>
                )}
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
                  <span className="section-kicker">Servico</span>
                  <h2 className="section-title">Lista de ordens</h2>
                  <p className="section-description">Quadro principal com busca, status, checklist e acoes para operar as OS de ponta a ponta.</p>
                </div>
              </div>

              <div className="search-bar">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por servico, cliente, endereco, telefone ou checklist..."
                  className="search-input"
                />
                <button type="button" className="button-ghost" onClick={() => setSearch('')}>
                  Limpar busca
                </button>
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
                    <h2 className="section-title">Preferencias de operacao</h2>
                    <p className="section-description">Estado da sessao atual e preferencias visuais para o uso diario do produto.</p>
                  </div>
                </div>

                <div className="spotlight-grid">
                  <div className="spotlight-item">
                    <span className="spotlight-label">Usuario</span>
                    <span className="spotlight-value">{session.user?.username}</span>
                    <span className="spotlight-note">Conta autenticada no painel web.</span>
                  </div>
                  <div className="spotlight-item">
                    <span className="spotlight-label">Tema</span>
                    <span className="spotlight-value">{theme === 'dark' ? 'Escuro' : 'Claro'}</span>
                    <span className="spotlight-note">Alternancia persistida entre acessos.</span>
                  </div>
                  <div className="spotlight-item">
                    <span className="spotlight-label">API</span>
                    <span className="spotlight-value">Web + mobile</span>
                    <span className="spotlight-note">Mesmo backend operando os dois clientes.</span>
                  </div>
                </div>
              </div>

              <div className="panel panel--padded">
                <div className="section-header">
                  <div>
                    <span className="section-kicker">Proximo ciclo</span>
                    <h2 className="section-title">Leitura de produto</h2>
                    <p className="section-description">Resumo do que esta pronto agora e do que sustenta os proximos passos de monetizacao e mobile.</p>
                  </div>
                </div>

                <ul className="auth-points" style={{ marginTop: 0 }}>
                  <li>
                    <div>
                      <span className="auth-point__title">Dashboard com identidade propria</span>
                      <span className="auth-point__body">A camada visual saiu do look generico e passou a comunicar produto de operacao de campo.</span>
                    </div>
                  </li>
                  <li>
                    <div>
                      <span className="auth-point__title">Tema claro e escuro</span>
                      <span className="auth-point__body">A alternancia visual agora faz parte do sistema, nao de uma tela isolada.</span>
                    </div>
                  </li>
                  <li>
                    <div>
                      <span className="auth-point__title">Base pronta para continuar</span>
                      <span className="auth-point__body">Com o shell estabilizado, fica mais seguro seguir para offline avancado, push e comprovacao de execucao.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Navegacao inferior">
        {navItems.map((item) => renderNavButton(item, true))}
      </nav>
    </div>
  );
}

export default TodoApp;
