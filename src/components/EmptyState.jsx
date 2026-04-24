import React from 'react';
import { FiClipboard } from 'react-icons/fi';

function EmptyState({
  title = 'Nenhuma ordem cadastrada',
  description = 'Comece com uma visita real para validar o fluxo do técnico e do dono da operação.',
}) {
  return (
    <div className="panel panel--padded">
      <div className="empty-state">
        <div className="empty-state__icon">
          <FiClipboard size={28} />
        </div>
        <h3 className="empty-state__title">{title}</h3>
        <p className="empty-state__description">{description}</p>
      </div>
    </div>
  );
}

export default EmptyState;
