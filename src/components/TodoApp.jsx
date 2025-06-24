import React, { useState, useEffect } from 'react';
import AddTaskForm from './AddTaskForm';
import TaskStats from './TaskStats';
import TaskList from './TaskList';
import Actions from './Actions';
import EmptyState from './EmptyState';

function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  // Carregar tarefas do localStorage ao iniciar
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Salvar tarefas no localStorage quando mudam
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text) => {
    if (!text.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      createdAt: new Date(),
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter((task) => !task.completed));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

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
      
      <AddTaskForm onAddTask={addTask} />
      
      <TaskStats 
        totalTasks={totalTasks} 
        filter={filter} 
        setFilter={setFilter} 
      />
      
      {totalTasks === 0 ? (
        <EmptyState />
      ) : (
        <>
          <TaskList 
            tasks={filteredTasks} 
            onToggleTask={toggleTask} 
            onDeleteTask={deleteTask} 
          />
          <Actions 
            completedTasks={completedTasks} 
            totalTasks={totalTasks} 
            onClearCompleted={clearCompleted} 
          />
        </>
      )}
    </div>
  );
}

export default TodoApp;