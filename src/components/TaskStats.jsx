import React from 'react';

function TaskStats({ totalTasks, filter, setFilter }) {
  return (
    <div className="flex justify-between items-center mb-4 px-2">
      <div className="text-sm text-gray-400">
        {/* <span className="font-medium">{totalTasks}</span> tarefas */}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`text-sm px-3 py-1 rounded-full transition-colors ${
            filter === 'all'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`text-sm px-3 py-1 rounded-full transition-colors ${
            filter === 'active'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Ativas
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`text-sm px-3 py-1 rounded-full transition-colors ${
            filter === 'completed'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Concluídas
        </button>
      </div>
    </div>
  );
}

export default TaskStats;