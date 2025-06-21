const { React } = window;
const { useState } = React;

const TaskItem = ({ task }) => {
  const { toggleTaskCompletion, deleteTask, updateTask } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleUpdate = (updatedFields) => {
    updateTask(task.id, updatedFields);
    setIsEditing(false);
  };

  const priorityStyles = {
    low: {
      border: "border-l-blue-500",
      badge: "bg-blue-100 text-blue-800",
    },
    medium: {
      border: "border-l-yellow-500",
      badge: "bg-yellow-100 text-yellow-800",
    },
    high: {
      border: "border-l-red-500",
      badge: "bg-red-100 text-red-800",
    },
  };

  if (isEditing) {
    return (
      <div
        className={`task-item ${
          priorityStyles[task.priority].border
        } bg-gray-50`}
      >
        <TaskForm
          task={task}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={`task-item ${priorityStyles[task.priority].border}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <label className="checkbox-container mt-1">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTaskCompletion(task.id)}
            />
            <span className="checkmark"></span>
          </label>
          <div className="flex-1">
            <h3
              className={`text-lg font-medium cursor-pointer ${
                task.completed ? "completed-task" : "text-gray-800"
              }`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {task.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`priority-badge ${
                  priorityStyles[task.priority].badge
                }`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(task.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {isExpanded && task.description && (
              <p
                className={`mt-3 text-gray-600 ${
                  task.completed ? "completed-task" : ""
                }`}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            aria-label="Edit task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Delete task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
