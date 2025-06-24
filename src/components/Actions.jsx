import React from 'react';

function Actions({ completedTasks, totalTasks, onClearCompleted }) {
  return (
    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
      <div className="text-sm text-gray-400">
        <span>{completedTasks}</span> de <span>{totalTasks}</span> concluídas
      </div>
      <button
        onClick={onClearCompleted}
        className="text-sm text-violet-500 hover:text-violet-400 font-medium transition-colors"
      >
        Limpar concluídas
      </button>
    </div>
  );
}

export default Actions;