import React, { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { buildOrderPayload, createOrderFormValues } from '../utils/orderForm';

const EMPTY_FORM = createOrderFormValues();

function AddTaskForm({ initialTask = null, onSubmitTask, onCancelEdit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [checklistDraft, setChecklistDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(createOrderFormValues(initialTask));
    setChecklistDraft('');
  }, [initialTask]);

  const checklistSummary = useMemo(() => {
    if (form.checklistItems.length === 0) {
      return 'Nenhum item de checklist adicionado para a visita.';
    }

    return `${form.checklistItems.length} item(ns) preparados para a execução.`;
  }, [form.checklistItems]);

  const isEditing = Boolean(initialTask?.id);

  const updateField = (field) => (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: event.target.value,
    }));
  };

  const addChecklistItem = () => {
    const trimmedLabel = checklistDraft.trim();
    if (!trimmedLabel) {
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      checklistItems: [
        ...currentForm.checklistItems,
        { label: trimmedLabel, done: false },
      ],
    }));
    setChecklistDraft('');
  };

  const removeChecklistItem = (indexToRemove) => {
    setForm((currentForm) => ({
      ...currentForm,
      checklistItems: currentForm.checklistItems.filter((_, index) => index !== indexToRemove),
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setChecklistDraft('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = buildOrderPayload(form);

    if (!payload.title || !payload.customerName) {
      return;
    }

    setSubmitting(true);

    try {
      const savedTask = await onSubmitTask(payload, initialTask);
      if (savedTask && !isEditing) {
        resetForm();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel panel--padded form-panel">
      <div className="panel-header panel-header--flush">
        <div>
          <span className="panel-kicker">Cadastro</span>
          <h2 className="panel-title">{isEditing ? 'Editar ordem de serviço' : 'Nova ordem de serviço'}</h2>
          <p className="panel-description">Registre cliente, data, técnico, contexto da visita e o checklist que vai guiar a equipe no campo.</p>
        </div>
        <span className="brand-subtitle">{isEditing ? 'Edição ativa' : 'Entrada rápida'}</span>
      </div>

      <div className="form-grid">
        <div className="form-field form-grid__full">
          <label htmlFor="order-title" className="field-label">Título do serviço</label>
          <input
            id="order-title"
            type="text"
            value={form.title}
            onChange={updateField('title')}
            placeholder="Ex.: Instalação de câmera no cliente Silva"
            className="input"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="order-customer" className="field-label">Cliente</label>
          <input
            id="order-customer"
            type="text"
            value={form.customerName}
            onChange={updateField('customerName')}
            placeholder="Nome do cliente"
            className="input"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="order-phone" className="field-label">Telefone</label>
          <input
            id="order-phone"
            type="tel"
            value={form.customerPhone}
            onChange={updateField('customerPhone')}
            placeholder="(11) 99999-9999"
            className="input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="order-date" className="field-label">Data do serviço</label>
          <input
            id="order-date"
            type="date"
            value={form.serviceDate}
            onChange={updateField('serviceDate')}
            className="input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="order-technician" className="field-label">Técnico responsável</label>
          <input
            id="order-technician"
            type="text"
            value={form.assignedTechnician}
            onChange={updateField('assignedTechnician')}
            placeholder="Nome de quem vai executar"
            className="input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="order-priority" className="field-label">Prioridade</label>
          <select
            id="order-priority"
            value={form.priority}
            onChange={updateField('priority')}
            className="select"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div className="form-field form-grid__full">
          <label htmlFor="order-address" className="field-label">Endereço</label>
          <input
            id="order-address"
            type="text"
            value={form.address}
            onChange={updateField('address')}
            placeholder="Rua, número, bairro e referência"
            className="input"
          />
        </div>

        <div className="form-field form-grid__full">
          <label htmlFor="order-notes" className="field-label">Observações</label>
          <textarea
            id="order-notes"
            value={form.notes}
            onChange={updateField('notes')}
            placeholder="Detalhes que ajudam a equipe a chegar pronta no local"
            className="textarea"
          />
        </div>
      </div>

      <div className="mini-panel checklist-builder">
        <div>
          <div className="mini-panel__title">Checklist da visita</div>
          <div className="panel-description">{checklistSummary}</div>
        </div>

        <div className="form-inline">
          <input
            type="text"
            value={checklistDraft}
            onChange={(event) => setChecklistDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addChecklistItem();
              }
            }}
            placeholder="Ex.: Conferir ponto de energia"
            className="input"
          />
          <button type="button" onClick={addChecklistItem} className="button-ghost">
            <FiPlus size={16} />
            Adicionar item
          </button>
        </div>

        {form.checklistItems.length > 0 ? (
          <div className="checklist-list">
            {form.checklistItems.map((item, index) => (
              <button
                key={`${item.id || item.label}-${index}`}
                type="button"
                onClick={() => removeChecklistItem(index)}
                className="checklist-chip"
              >
                <span>{item.label}</span>
                <span className="checklist-chip__remove">
                  <FiX size={14} />
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="form-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="form-note">Dica: combine cliente, técnico, endereço e checklist para deixar a equipe pronta antes da saída.</p>
        <div className="button-row" style={{ justifyContent: 'flex-end' }}>
          {isEditing ? (
            <button type="button" onClick={onCancelEdit} className="button-ghost">
              Cancelar edição
            </button>
          ) : null}
          <button type="submit" disabled={submitting} className="button-primary">
            {submitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar OS'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddTaskForm;
