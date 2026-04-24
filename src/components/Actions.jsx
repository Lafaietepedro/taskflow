import React from 'react';

function Actions({ completedTasks, totalTasks, onClearCompleted }) {
  return (
    <div className="panel panel--padded">
      <div className="section-header">
        <div>
          <span className="panel-kicker">Fechamento</span>
          <h3 className="panel-title">Arquivamento e faturamento</h3>
          <p className="panel-description">
            {completedTasks} de {totalTasks} ordens já estão prontas para sair do quadro operacional.
          </p>
        </div>
        <button
          type="button"
          onClick={onClearCompleted}
          disabled={completedTasks === 0}
          className="button-ghost"
        >
          Limpar concluídas
        </button>
      </div>
    </div>
  );
}

export default Actions;
