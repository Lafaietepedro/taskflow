import React from 'react';
import TaskItem from './TaskItem';

function TaskList({ tasks, technicianName, onStatusChange, onChecklistToggle, onEditTask, onDeleteTask }) {
  return (
    <div className="panel panel--scroll">
      <div className="panel-header panel-header--flush">
        <div>
          <span className="panel-kicker">Ordens</span>
          <h3 className="panel-title">Fila operacional</h3>
          <p className="panel-description">Leitura em formato de despacho, com dados essenciais, progresso e acoes rapidas por OS.</p>
        </div>
      </div>

      <div className="orders-table">
        <div className="orders-table__header">
          <span className="orders-table__head">ID</span>
          <span className="orders-table__head">Servico / cliente</span>
          <span className="orders-table__head">Agenda</span>
          <span className="orders-table__head">Status</span>
          <span className="orders-table__head">Tecnico</span>
          <span className="orders-table__head">Checklist</span>
          <span className="orders-table__head">Acoes</span>
        </div>

        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            technicianName={technicianName}
            onStatusChange={onStatusChange}
            onChecklistToggle={onChecklistToggle}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}

export default TaskList;
