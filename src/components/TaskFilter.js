const { React } = window;

const TaskFilter = ({ filter, setFilter }) => {
    return (
        <div className="flex space-x-2">
            <button
                onClick={() => setFilter("all")}
                className={`filter-btn ${filter === "all"
                    ? "bg-indigo-100 text-indigo-800 font-medium"
                    : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
                All
            </button>
            <button
                onClick={() => setFilter("active")}
                className={`filter-btn ${filter === "active"
                    ? "bg-indigo-100 text-indigo-800 font-medium"
                    : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
                Active
            </button>
            <button
                onClick={() => setFilter("completed")}
                className={`filter-btn ${filter === "completed"
                    ? "bg-indigo-100 text-indigo-800 font-medium"
                    : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
                Completed
            </button>
        </div>
    );
};

export default TaskFilter;


