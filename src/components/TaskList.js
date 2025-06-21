
const { React } = window;
const { useState, useMemo } = React;

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

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600">
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7
                        7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input pl-12"
                />
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6
                space-y-4 sm:space-y-0">
                <TaskFilter filter={filter} setFilter={setFilter} />
                <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Sort:</span>
                    <select
                        value={`${sortBy}-${sortDirection}`}
                        onChange={(e) => {
                            const [field, direction] = e.target.value.split('-');
                            setSortBy(field);
                            setSortDirection(direction);
                        }}
                        className="px-3 py-2 bg-white border-0 rounded-lg text-sm shadow-sm focus:ring-2
                        focus:ring-indigo-500 focus:outline-none"
                    >
                        <option value="createdAt-desc">Date (Newest)</option>
                        <option value="createdAt-asc">Date (Oldest)</option>
                        <option value="title-asc">Title (A-Z)</option>
                        <option value="title-desc">Title (Z-A)</option>
                        <option value="priority-desc">Priority (High-Low)</option>
                        <option value="priority-asc">Priority (Low-High)</option>
                    </select>
                </div>
            </div>
            {filteredTasks.length === 0 ? (
                <div className="text-center py-12 glass-effect rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-300"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2
                        2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0
                        012-2h2a2 2 0 012 2M15 13l-3 3m0 0l-3-3m3 3V8" />
                    </svg>
                    <p className="mt-4 text-gray-500 font-medium">No tasks found</p>
                    <p className="text-gray-400 text-sm mt-1">
                        {filter !== 'all'
                            ? `Try switching to "All" filter or create a new task`
                            : searchTerm
                                ? `No results for "${searchTerm}"`
                                : `Start by adding your first task`}
                    </p>
                </div>
            ) : (
                <div>
                    <div className="space-y-3">
                        {filteredTasks.map(task => (
                            <TaskItem key={task.id} task={task} />
                        ))}
                    </div>
                    <div className="mt-6 flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">{filteredTasks.length}
                            task{filteredTasks.length !== 1 ? 's' : ''}</span>
                        {tasks.some(task => task.completed) && (
                            <button
                                onClick={clearCompletedTasks}
                                className="text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                Clear completed
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskList;


