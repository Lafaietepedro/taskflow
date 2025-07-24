import React, { useState, useEffect } from 'react';
import AddTaskForm from './AddTaskForm';
import TaskStats from './TaskStats';
import TaskList from './TaskList';
import Actions from './Actions';
import EmptyState from './EmptyState';

const API_URL = 'http://localhost:5000';

function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Helper para pegar o token
  const getToken = () => localStorage.getItem('token');

  // Buscar tarefas do backend ao iniciar
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setMessage("");
      try {
        const res = await fetch(`${API_URL}/tasks`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error('Erro ao buscar tarefas.');
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        setMessage('Erro ao carregar tarefas.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Adicionar tarefa
  const addTask = async (text) => {
    if (!text.trim()) {
      setMessage("Digite uma tarefa válida.");
      return;
    }
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao adicionar tarefa.');
      setTasks([data, ...tasks]);
      setMessage("Tarefa adicionada com sucesso!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Alternar tarefa concluída
  const toggleTask = async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ text: task.text, completed: !task.completed })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar tarefa.');
      setTasks(tasks.map(t => t._id === id ? data : t));
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Deletar tarefa
  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao remover tarefa.');
      setTasks(tasks.filter(t => t._id !== id));
      setMessage("Tarefa removida.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Limpar concluídas
  const clearCompleted = async () => {
    const completed = tasks.filter(t => t.completed);
    for (const task of completed) {
      await deleteTask(task._id);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  }).filter((task) => task.text.toLowerCase().includes(search.toLowerCase()));

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;

  return (
    <div className="w-full max-w-lg bg-gray-800 rounded-xl shadow-lg p-6">
      <h1 className="text-2xl font-bold text-white text-center mb-6">
        TaskFlow
        <span className="block text-sm font-normal text-violet-300 mt-1">
          Organize suas tarefas com simplicidade
        </span>
      </h1>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar tarefas..."
        className="w-full mb-4 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 outline-none"
      />
      {message && (
        <div className="mb-4 px-4 py-2 rounded bg-violet-700 text-white text-center animate-fadeIn">
          {message}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <svg className="animate-spin h-8 w-8 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      ) : (
        <>
          <AddTaskForm onAddTask={addTask} />
          <TaskStats totalTasks={totalTasks} filter={filter} setFilter={setFilter} />
          {totalTasks === 0 ? (
            <EmptyState />
          ) : (
            <>
              <TaskList tasks={filteredTasks} onToggleTask={task => toggleTask(task._id)} onDeleteTask={id => deleteTask(id)} />
              <Actions completedTasks={completedTasks} totalTasks={totalTasks} onClearCompleted={clearCompleted} />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default TodoApp;