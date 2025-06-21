const { React } = window;
const { useState, useEffect } = React;

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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                </label>
                <input
                    type="text"
                    id="title"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Buy groceries"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição (Opcional)
                </label>
                <textarea
                    id="description"
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Milk, eggs, bread, and fruits"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
            </div>
            <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                </label>
                <div className="flex space-x-4">
                    {['low', 'medium', 'high'].map((p) => (
                        <label key={p} className="flex items-center">
                            <input
                                type="radio"
                                name="priority"
                                value={p}
                                checked={priority === p}
                                onChange={() => setPriority(p)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{p}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="btn-primary"
                >
                    {task ? 'Update Task' : 'Add Task'}
                </button>
            </div>
        </form>
    );
};

export default TaskForm;


