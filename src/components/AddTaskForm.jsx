import React, { useState } from 'react';

function AddTaskForm({ onAddTask }) {
  const [taskText, setTaskText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTask(taskText);
    setTaskText('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex items-center bg-gray-700 rounded-xl overflow-hidden shadow-sm border border-gray-600">
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Adicionar uma nova tarefa..."
          className="flex-grow px-4 py-3 bg-transparent outline-none text-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 font-medium transition-colors"
        >
          Adicionar
        </button>
      </div>
    </form>
  );
}

export default AddTaskForm;