import React from 'react';
import TodoApp from './components/TodoApp';
import { useState, useEffect } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';

const API_URL = 'http://localhost:5000'; // ajuste para produção depois

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' ou 'register'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro inesperado.');
      } else {
        if (mode === 'login') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', data.username);
          onAuth(data.username);
        } else {
          setSuccess('Cadastro realizado! Faça login.');
          setMode('login');
          setUsername("");
          setPassword("");
        }
      }
    } catch (err) {
      setError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Gradiente animado cobrindo toda a tela */}
      <div className="fixed inset-0 z-0 w-full h-full bg-gradient-to-br from-violet-900 via-gray-900 to-gray-800 animate-bgMove" />
      <div className="fixed inset-0 z-0 w-full h-full bg-gradient-to-tr from-violet-700/30 via-violet-400/10 to-transparent blur-2xl opacity-60 animate-pulse-slow" />
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-700 bg-gray-800/80 backdrop-blur-xl flex flex-col items-center gap-2 animate-fadeIn">
        <img src="/vite.svg" alt="Logo" className="w-16 h-16 mb-2 drop-shadow-lg animate-fadeIn" />
        <h2 className="text-4xl font-extrabold text-white mb-1 text-center tracking-tight drop-shadow">TaskFlow</h2>
        <p className="text-violet-300 text-base mb-6 text-center">Organize suas tarefas com estilo</p>
        <div className="w-full flex flex-col gap-4 mb-2">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 text-lg pointer-events-none" />
            <input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700/80 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition-all shadow-sm border border-gray-600 focus:border-violet-500"
              autoFocus
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 text-lg pointer-events-none" />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700/80 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition-all shadow-sm border border-gray-600 focus:border-violet-500"
            />
          </div>
        </div>
        {error && <div className="mb-2 px-4 py-2 rounded-lg bg-red-700/90 text-white text-center animate-fadeIn shadow-md border border-red-400 w-full">{error}</div>}
        {success && <div className="mb-2 px-4 py-2 rounded-lg bg-green-700/90 text-white text-center animate-fadeIn shadow-md border border-green-400 w-full">{success}</div>}
        <button type="submit" disabled={loading} className="w-full py-3 mt-2 rounded-xl font-bold text-lg bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'Enviando...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
        </button>
        <div className="text-sm text-gray-400 mt-4 text-center">
          {mode === 'login' ? (
            <>
              Não tem conta?{' '}
              <button type="button" className="underline hover:text-violet-300 font-semibold transition-colors" onClick={() => { setMode('register'); setError(""); setSuccess(""); }}>Cadastre-se</button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button type="button" className="underline hover:text-violet-300 font-semibold transition-colors" onClick={() => { setMode('login'); setError(""); setSuccess(""); }}>Entrar</button>
            </>
          )}
        </div>
      </form>
      <style>{`
        @keyframes bgMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-bgMove {
          animation: bgMove 10s linear infinite alternate;
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(savedUser);
  }, []);

  const handleAuth = (username) => {
    setUser(username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (!user) return <Auth onAuth={handleAuth} />;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <button onClick={handleLogout} className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">Sair</button>
      <TodoApp />
    </div>
  );
}

export default App;