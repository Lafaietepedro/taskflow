import React from 'react';

function EmptyState() {
  return (
    <div className="max-w-xs mx-auto text-center mt-8 py-8">
      <svg
        className="w-32 h-32 mx-auto mb-4 text-violet-400 opacity-70"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
      <p className="text-white text-lg font-medium">Nenhuma tarefa ainda</p>
      <p className="text-violet-300 text-sm mt-1">Adicione sua primeira tarefa acima</p>
    </div>
  );
}

export default EmptyState;