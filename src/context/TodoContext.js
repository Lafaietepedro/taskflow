
const { React } = window;
const { createContext, useContext, useState, useEffect } = React;

const TodoContext = createContext();

export const useTodo = () => useContext(TodoContext);

export const TodoProvider = ({ children }) => {
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

    return (
        <TodoContext.Provider
            value={{
                tasks,
                addTask,
                toggleTaskCompletion,
                deleteTask,
                updateTask,
                clearCompletedTasks,
                isLoading,
            }}
        >
            {children}
        </TodoContext.Provider>
    );
};


