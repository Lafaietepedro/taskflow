import React from 'react';
import { FiActivity } from 'react-icons/fi';

function ActivityFeed({ items }) {
  if (items.length === 0) {
    return (
      <div className="panel panel--padded">
        <div className="panel-header panel-header--flush">
          <div>
            <span className="panel-kicker">Atividade</span>
            <h3 className="panel-title">Feed operacional</h3>
            <p className="panel-description">As proximas mudancas de status e criacoes de OS vao aparecer aqui.</p>
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-state__icon">
            <FiActivity size={28} />
          </div>
          <h4 className="empty-state__title">Sem eventos recentes</h4>
          <p className="empty-state__description">Quando as ordens comecarem a circular, o feed vai mostrar criacoes, inicios, conclusoes e lembretes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel panel--padded">
      <div className="panel-header panel-header--flush">
        <div>
          <span className="panel-kicker">Atividade</span>
          <h3 className="panel-title">Feed operacional</h3>
          <p className="panel-description">Visibilidade do que foi criado, iniciado, concluido e do que pede acompanhamento.</p>
        </div>
      </div>

      <div className="activity-feed">
        {items.map((item) => (
          <div key={item.id} className="activity-item">
            <span className={`activity-dot activity-dot--${item.type}`} />
            <div>
              <div className="activity-item__text">{item.text}</div>
              <span className="activity-item__meta">{item.meta}</span>
            </div>
            <span className="activity-item__time">{item.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityFeed;
