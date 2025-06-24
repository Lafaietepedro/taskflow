import React from 'react';

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-xl shadow-sm border border-gray-600 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onToggle(task.id)}>
        <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
          task.completed 
            ? 'bg-violet-600 border-violet-600' 
            : 'bg-transparent border border-gray-400 hover:border-violet-500'
        }`}>
          {task.completed && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
        <span className={`${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>
          {task.text}
        </span>
      </div>
      <button
        className="text-gray-400 hover:text-red-500 transition-colors p-1"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}

export default TaskItem;