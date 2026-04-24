import React, { useEffect, useMemo, useState } from 'react';
import { FiArrowRight, FiLock, FiMoon, FiPlayCircle, FiSun, FiUser } from 'react-icons/fi';
import TodoApp from './components/TodoApp';
import { login, register } from './services/auth';
import { DEMO_CREDENTIALS } from './config/env';

const SESSION_KEY = 'taskflow.session';
const THEME_KEY = 'taskflow.theme';

function readSession() {
  try {
    const rawSession = localStorage.getItem(SESSION_KEY);
    if (!rawSession) {
      return null;
    }

    return JSON.parse(rawSession);
  } catch (_error) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function persistSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function readTheme() {
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function persistTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function ThemeSwitch({ theme, onToggle }) {
  return (
    <button type="button" className="theme-switch" onClick={onToggle} aria-label="Alternar tema visual">
      {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
      <span className="theme-switch__label">{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
    </button>
  );
}

function Auth({ onAuth, theme, onToggleTheme }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const authTitle = mode === 'login' ? 'Entrar na operação' : 'Criar conta de equipe';
  const authDescription = mode === 'login'
    ? 'Acesse o painel industrial do TaskFlow Field para organizar ordens, equipe e o fluxo de campo.'
    : 'Cadastre a conta inicial da operação para testar o produto, validar o fluxo e preparar a base de receita.';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'register' && password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await login({ username, password });
        const session = {
          token: response.token,
          user: response.user,
        };

        persistSession(session);
        onAuth(session);
      } else {
        await register({ username, password });
        setSuccess('Cadastro realizado. Faça login para continuar.');
        setMode('login');
        setPassword('');
      }
    } catch (requestError) {
      setError(requestError.message || 'Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (!DEMO_CREDENTIALS.enabled) {
      return;
    }

    setError('');
    setSuccess('');
    setMode('login');
    setUsername(DEMO_CREDENTIALS.username);
    setPassword(DEMO_CREDENTIALS.password);
    setLoading(true);

    try {
      const response = await login(DEMO_CREDENTIALS);
      const session = {
        token: response.token,
        user: response.user,
      };

      persistSession(session);
      onAuth(session);
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível entrar na conta demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="auth-hero__top">
          <div className="logo-stack">
            <div className="brand-mark" style={{ fontSize: '2rem' }}>
              <span className="brand-mark__task">Task</span>
              <span className="brand-mark__flow">Flow</span>
            </div>
            <span className="brand-subtitle">Field operations platform</span>
          </div>
          <ThemeSwitch theme={theme} onToggle={onToggleTheme} />
        </div>

        <div className="auth-hero__content">
          <span className="auth-kicker">Dark industrial system</span>
          <h1 className="auth-title">Ordens, equipe e campo no mesmo painel.</h1>
          <p className="auth-description">
            Produto pensado para equipes pequenas que precisam de contexto rápido, linguagem visual objetiva e operação sem ruído.
          </p>

          <div className="auth-metrics">
            <div className="metric-chip">
              <span className="metric-chip__label">Tempo de resposta</span>
              <span className="metric-chip__value">10 min</span>
              <span className="metric-chip__note">Meta de ativação da primeira OS</span>
            </div>
            <div className="metric-chip">
              <span className="metric-chip__label">Stack</span>
              <span className="metric-chip__value">Web + API</span>
              <span className="metric-chip__note">Base pronta para mobile</span>
            </div>
            <div className="metric-chip">
              <span className="metric-chip__label">Perfil</span>
              <span className="metric-chip__value">Campo</span>
              <span className="metric-chip__note">Técnicos, autônomos e pequenas equipes</span>
            </div>
          </div>

          <ul className="auth-points">
            <li>
              <div>
                <span className="auth-point__title">Painel profissional</span>
                <span className="auth-point__body">Dashboard, ordens e atividade com leitura rápida para quem decide e para quem executa.</span>
              </div>
            </li>
            <li>
              <div>
                <span className="auth-point__title">Fluxo pronto para venda</span>
                <span className="auth-point__body">Estrutura pensada para evoluir para assinatura, app mobile e uso real em equipes de campo.</span>
              </div>
            </li>
            <li>
              <div>
                <span className="auth-point__title">Mesma API, múltiplos clientes</span>
                <span className="auth-point__body">O backend já suporta web e mobile compartilhando sessão, ordens e checklist.</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="auth-hero__footer">
          <div>
            <div className="auth-footer__tag">Nicho validado</div>
            <div className="auth-footer__line">Assistência técnica, instaladores, manutenção e visitas recorrentes.</div>
          </div>
          <div>
            <div className="auth-footer__tag">Visual identity</div>
            <div className="auth-footer__line">Dark industrial com foco em velocidade de leitura.</div>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form__header">
            <span className="panel-kicker">Controle de acesso</span>
            <h2 className="auth-form__title">{authTitle}</h2>
            <p className="auth-form__description">{authDescription}</p>
          </div>

          <div className="form-field">
            <label htmlFor="auth-username">Usuário</label>
            <div className="input-shell">
              <FiUser className="input-shell__icon" size={18} />
              <input
                id="auth-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Equipe, técnico ou responsável"
                className="input"
                autoFocus
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="auth-password">Senha</label>
            <div className="input-shell">
              <FiLock className="input-shell__icon" size={18} />
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                placeholder="Mínimo de 6 caracteres"
                className="input"
              />
            </div>
            {mode === 'register' && (
              <span className="helper-text">Use pelo menos 6 caracteres para concluir o cadastro.</span>
            )}
          </div>

          {error ? <div className="notice notice--error">{error}</div> : null}
          {success ? <div className="notice notice--success">{success}</div> : null}

          <div className="button-row">
            <button type="submit" disabled={loading} className="button-primary" style={{ width: '100%' }}>
              {loading ? 'Processando...' : mode === 'login' ? 'Entrar na operação' : 'Criar conta'}
              {!loading ? <FiArrowRight size={16} /> : null}
            </button>
          </div>

          {DEMO_CREDENTIALS.enabled ? (
            <button type="button" disabled={loading} className="button-ghost demo-login-button" onClick={handleDemoLogin}>
              <FiPlayCircle size={16} />
              Entrar com conta demo
            </button>
          ) : null}

          <div className="auth-form__switch">
            {mode === 'login' ? (
              <>
                Não tem conta?{' '}
                <button
                  type="button"
                  className="button-link"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Cadastrar equipe
                </button>
              </>
            ) : (
              <>
                Já tem acesso?{' '}
                <button
                  type="button"
                  className="button-link"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Fazer login
                </button>
              </>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [theme, setTheme] = useState(() => readTheme());

  useEffect(() => {
    const storedSession = readSession();
    if (storedSession?.token) {
      setSession(storedSession);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    persistTheme(theme);
  }, [theme]);

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const appContent = useMemo(() => {
    if (!session) {
      return <Auth onAuth={setSession} theme={theme} onToggleTheme={toggleTheme} />;
    }

    return (
      <TodoApp
        session={session}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }, [session, theme]);

  return <div className="app-root">{appContent}</div>;
}

export default App;
