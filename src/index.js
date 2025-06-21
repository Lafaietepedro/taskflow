const { React, ReactDOM } = window;
const { useState, createContext, useContext, useEffect, useMemo } = React;

// Context
const TodoContext = createContext();

const useTodo = () => useContext(TodoContext);

const TodoProvider = ({ children }) => {
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        setIsLoading(false);
    }, [tasks]);

    const addTask = (title, description, priority) => {
        setTasks(prevTasks => [
            ...prevTasks,
            {
                id: Date.now(),
                title,
                description,
                priority,
                completed: false,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const toggleTaskCompletion = (id) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const deleteTask = (id) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    };

    const updateTask = (id, updatedFields) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, ...updatedFields } : task
            )
        );
    };

    const clearCompletedTasks = () => {
        setTasks(prevTasks => prevTasks.filter(task => !task.completed));
    };

    return React.createElement(
        TodoContext.Provider,
        {
            value: {
                tasks,
                addTask,
                toggleTaskCompletion,
                deleteTask,
                updateTask,
                clearCompletedTasks,
                isLoading,
            }
        },
        children
    );
};

// TaskForm Component
const TaskForm = ({ task, onSubmit, onCancel }) => {
    const [title, setTitle] = useState(task ? task.title : '');
    const [description, setDescription] = useState(task ? task.description : '');
    const [priority, setPriority] = useState(task ? task.priority : 'low');

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setPriority(task.priority);
        }
    }, [task]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title, description, priority });
    };

    return React.createElement('form', 
        { onSubmit: handleSubmit, className: "space-y-4" },
        React.createElement('div', null,
            React.createElement('label', 
                { htmlFor: "title", className: "block text-sm font-medium text-gray-700 mb-1" },
                "Title"
            ),
            React.createElement('input', {
                type: "text",
                id: "title",
                className: "w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500",
                placeholder: "e.g., Buy groceries",
                value: title,
                onChange: (e) => setTitle(e.target.value),
                required: true
            })
        ),
        React.createElement('div', null,
            React.createElement('label', 
                { htmlFor: "description", className: "block text-sm font-medium text-gray-700 mb-1" },
                "Description (Optional)"
            ),
            React.createElement('textarea', {
                id: "description",
                rows: "3",
                className: "w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500",
                placeholder: "e.g., Milk, eggs, bread, and fruits",
                value: description,
                onChange: (e) => setDescription(e.target.value)
            })
        ),
        React.createElement('div', null,
            React.createElement('label', 
                { htmlFor: "priority", className: "block text-sm font-medium text-gray-700 mb-1" },
                "Priority"
            ),
            React.createElement('div', { className: "flex space-x-4" },
                ['low', 'medium', 'high'].map((p) =>
                    React.createElement('label', { key: p, className: "flex items-center" },
                        React.createElement('input', {
                            type: "radio",
                            name: "priority",
                            value: p,
                            checked: priority === p,
                            onChange: () => setPriority(p),
                            className: "h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        }),
                        React.createElement('span', 
                            { className: "ml-2 text-sm text-gray-700 capitalize" },
                            p
                        )
                    )
                )
            )
        ),
        React.createElement('div', { className: "flex justify-end space-x-3 pt-2" },
            onCancel && React.createElement('button', {
                type: "button",
                onClick: onCancel,
                className: "btn-secondary"
            }, "Cancel"),
            React.createElement('button', {
                type: "submit",
                className: "btn-primary"
            }, task ? 'Update Task' : 'Add Task')
        )
    );
};

// TaskItem Component
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
            border: 'border-l-blue-500',
            badge: 'bg-blue-100 text-blue-800'
        },
        medium: {
            border: 'border-l-yellow-500',
            badge: 'bg-yellow-100 text-yellow-800'
        },
        high: {
            border: 'border-l-red-500',
            badge: 'bg-red-100 text-red-800'
        }
    };

    if (isEditing) {
        return React.createElement('div', 
            { className: `task-item ${priorityStyles[task.priority].border} bg-gray-50` },
            React.createElement(TaskForm, {
                task: task,
                onSubmit: handleUpdate,
                onCancel: () => setIsEditing(false)
            })
        );
    }

    return React.createElement('div', 
        { className: `task-item ${priorityStyles[task.priority].border}` },
        React.createElement('div', { className: "flex items-start justify-between" },
            React.createElement('div', { className: "flex items-start space-x-3 flex-1" },
                React.createElement('label', { className: "checkbox-container mt-1" },
                    React.createElement('input', {
                        type: "checkbox",
                        checked: task.completed,
                        onChange: () => toggleTaskCompletion(task.id)
                    }),
                    React.createElement('span', { className: "checkmark" })
                ),
                React.createElement('div', { className: "flex-1" },
                    React.createElement('h3', {
                        className: `text-lg font-medium cursor-pointer ${task.completed ? 'completed-task' : 'text-gray-800'}`,
                        onClick: () => setIsExpanded(!isExpanded)
                    }, task.title),
                    React.createElement('div', { className: "flex items-center space-x-2 mt-1" },
                        React.createElement('span', 
                            { className: `priority-badge ${priorityStyles[task.priority].badge}` },
                            task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
                        ),
                        React.createElement('span', { className: "text-xs text-gray-500" },
                            new Date(task.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                        )
                    ),
                    (isExpanded && task.description) && React.createElement('p', 
                        { className: `mt-3 text-gray-600 ${task.completed ? 'completed-task' : ''}` },
                        task.description
                    )
                )
            ),
            React.createElement('div', { className: "flex space-x-1" },
                React.createElement('button', {
                    onClick: () => setIsEditing(true),
                    className: "p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors",
                    'aria-label': "Edit task"
                },
                    React.createElement('svg', {
                        xmlns: "http://www.w3.org/2000/svg",
                        className: "h-5 w-5",
                        viewBox: "0 0 20 20",
                        fill: "currentColor"
                    },
                        React.createElement('path', {
                            d: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                        })
                    )
                ),
                React.createElement('button', {
                    onClick: () => deleteTask(task.id),
                    className: "p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors",
                    'aria-label': "Delete task"
                },
                    React.createElement('svg', {
                        xmlns: "http://www.w3.org/2000/svg",
                        className: "h-5 w-5",
                        viewBox: "0 0 20 20",
                        fill: "currentColor"
                    },
                        React.createElement('path', {
                            fillRule: "evenodd",
                            d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z",
                            clipRule: "evenodd"
                        })
                    )
                )
            )
        )
    );
};

// TaskFilter Component
const TaskFilter = ({ filter, setFilter }) => {
    return React.createElement('div', { className: "flex space-x-2" },
        React.createElement('button', {
            onClick: () => setFilter("all"),
            className: `filter-btn ${filter === "all"
                ? "bg-indigo-100 text-indigo-800 font-medium"
                : "bg-white text-gray-600 hover:bg-gray-50"}`
        }, "All"),
        React.createElement('button', {
            onClick: () => setFilter("active"),
            className: `filter-btn ${filter === "active"
                ? "bg-indigo-100 text-indigo-800 font-medium"
                : "bg-white text-gray-600 hover:bg-gray-50"}`
        }, "Active"),
        React.createElement('button', {
            onClick: () => setFilter("completed"),
            className: `filter-btn ${filter === "completed"
                ? "bg-indigo-100 text-indigo-800 font-medium"
                : "bg-white text-gray-600 hover:bg-gray-50"}`
        }, "Completed")
    );
};

// TaskList Component
const TaskList = () => {
    const { tasks, clearCompletedTasks, isLoading } = useTodo();
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');

    const filteredTasks = useMemo(() => {
        let result = [...tasks];

        if (filter === 'active') {
            result = result.filter(task => !task.completed);
        } else if (filter === 'completed') {
            result = result.filter(task => task.completed);
        }

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            result = result.filter(task =>
                task.title.toLowerCase().includes(lowerSearchTerm) ||
                task.description.toLowerCase().includes(lowerSearchTerm)
            );
        }

        result.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'title') {
                comparison = a.title.localeCompare(b.title);
            } else if (sortBy === 'priority') {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
            } else if (sortBy === 'createdAt') {
                comparison = new Date(a.createdAt) - new Date(b.createdAt);
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [tasks, filter, searchTerm, sortBy, sortDirection]);

    if (isLoading) {
        return React.createElement('div', { className: "flex justify-center items-center h-32" },
            React.createElement('div', { className: "animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" })
        );
    }

    return React.createElement('div', null,
        React.createElement('div', { className: "mb-6 relative" },
            React.createElement('div', { className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" },
                React.createElement('svg', {
                    xmlns: "http://www.w3.org/2000/svg",
                    className: "h-5 w-5 text-gray-400",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor"
                },
                    React.createElement('path', {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    })
                )
            ),
            React.createElement('input', {
                type: "text",
                placeholder: "Search tasks...",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: "search-input pl-12"
            })
        ),
        React.createElement('div', { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0" },
            React.createElement(TaskFilter, { filter: filter, setFilter: setFilter }),
            React.createElement('div', { className: "flex items-center" },
                React.createElement('span', { className: "text-sm text-gray-600 mr-2" }, "Sort:"),
                React.createElement('select', {
                    value: `${sortBy}-${sortDirection}`,
                    onChange: (e) => {
                        const [field, direction] = e.target.value.split('-');
                        setSortBy(field);
                        setSortDirection(direction);
                    },
                    className: "px-3 py-2 bg-white border-0 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                },
                    React.createElement('option', { value: "createdAt-desc" }, "Date (Newest)"),
                    React.createElement('option', { value: "createdAt-asc" }, "Date (Oldest)"),
                    React.createElement('option', { value: "title-asc" }, "Title (A-Z)"),
                    React.createElement('option', { value: "title-desc" }, "Title (Z-A)"),
                    React.createElement('option', { value: "priority-desc" }, "Priority (High-Low)"),
                    React.createElement('option', { value: "priority-asc" }, "Priority (Low-High)")
                )
            )
        ),
        filteredTasks.length === 0 ? 
            React.createElement('div', { className: "text-center py-12 glass-effect rounded-xl" },
                React.createElement('svg', {
                    xmlns: "http://www.w3.org/2000/svg",
                    className: "h-16 w-16 mx-auto text-indigo-300",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor"
                },
                    React.createElement('path', {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    })
                ),
                React.createElement('p', { className: "mt-4 text-gray-500 font-medium" }, "No tasks found"),
                React.createElement('p', { className: "text-gray-400 text-sm mt-1" },
                    filter !== 'all'
                        ? `Try switching to "All" filter or create a new task`
                        : searchTerm
                            ? `No results for "${searchTerm}"`
                            : `Start by adding your first task`
                )
            ) :
            React.createElement('div', null,
                React.createElement('div', { className: "space-y-3" },
                    filteredTasks.map(task =>
                        React.createElement(TaskItem, { key: task.id, task: task })
                    )
                ),
                React.createElement('div', { className: "mt-6 flex justify-between items-center text-sm" },
                    React.createElement('span', { className: "text-gray-600 font-medium" },
                        `${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''}`
                    ),
                    tasks.some(task => task.completed) && React.createElement('button', {
                        onClick: clearCompletedTasks,
                        className: "text-indigo-600 hover:text-indigo-800 font-medium"
                    }, "Clear completed")
                )
            )
    );
};

// Main App Component
const App = () => {
    const { addTask } = useTodo();
    const [showForm, setShowForm] = useState(false);

    const handleAddTask = (taskData) => {
        addTask(taskData.title, taskData.description, taskData.priority);
        setShowForm(false);
    };

    return React.createElement('div', { className: "max-w-3xl mx-auto" },
        React.createElement('header', { className: "mb-10 text-center" },
            React.createElement('div', { className: "inline-block mb-3" },
                React.createElement('div', { className: "flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg" },
                    React.createElement('svg', {
                        xmlns: "http://www.w3.org/2000/svg",
                        className: "h-8 w-8",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor"
                    },
                        React.createElement('path', {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M15 13l-3 3m0 0l-3-3m3 3V8"
                        })
                    )
                )
            ),
            React.createElement('h1', { className: "text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text" }, "TaskFlow"),
            React.createElement('p', { className: "text-gray-600 mt-2" }, "Organize your tasks with style")
        ),
        React.createElement('div', { className: "mb-8" },
            showForm ?
                React.createElement('div', { className: "glass-effect rounded-xl overflow-hidden" },
                    React.createElement('div', { className: "bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4" },
                        React.createElement('h2', { className: "text-white text-lg font-medium" }, "Add New Task")
                    ),
                    React.createElement('div', { className: "p-6" },
                        React.createElement(TaskForm, {
                            onSubmit: handleAddTask,
                            onCancel: () => setShowForm(false)
                        })
                    )
                ) :
                React.createElement('button', {
                    onClick: () => setShowForm(true),
                    className: "w-full flex items-center justify-center px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                },
                    React.createElement('svg', {
                        xmlns: "http://www.w3.org/2000/svg",
                        className: "h-5 w-5 mr-2",
                        viewBox: "0 0 20 20",
                        fill: "currentColor"
                    },
                        React.createElement('path', {
                            fillRule: "evenodd",
                            d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z",
                            clipRule: "evenodd"
                        })
                    ),
                    "Add New Task"
                )
        ),
        React.createElement('div', { className: "glass-effect rounded-xl overflow-hidden" },
            React.createElement('div', { className: "bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4" },
                React.createElement('h2', { className: "text-white text-lg font-medium" }, "My Tasks")
            ),
            React.createElement('div', { className: "p-6" },
                React.createElement(TaskList)
            )
        ),
        React.createElement('footer', { className: "mt-10 text-center text-sm text-gray-500" },
            React.createElement('p', null, "TaskFlow - Your Modern To-Do List")
        )
    );
};

// Render the App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    React.createElement(TodoProvider, null,
        React.createElement(App)
    )
);

