import React, { createContext, useContext, useState, useEffect } from 'react';

const TodoContext = createContext();

export const TodoProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load tasks from localStorage or API
    const stored = localStorage.getItem('tasks');
    setTasks(stored ? JSON.parse(stored) : []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title, description, priority) => {
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
  };

  const toggleTaskCompletion = id => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const updateTask = (id, updatedFields) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  };

  const deleteTask = id => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const clearCompletedTasks = () => {
    setTasks(tasks.filter(t => !t.completed));
  };

  return (
    <TodoContext.Provider value={{ tasks, isLoading, addTask, toggleTaskCompletion, updateTask, deleteTask, clearCompletedTasks }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => useContext(TodoContext);