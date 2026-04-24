export function formatDateForInput(serviceDate) {
  if (!serviceDate) {
    return '';
  }

  return String(serviceDate).slice(0, 10);
}

export function createOrderFormValues(task) {
  const safeTask = task || {};

  return {
    title: safeTask.title || '',
    customerName: safeTask.customerName || '',
    customerPhone: safeTask.customerPhone || '',
    serviceDate: formatDateForInput(safeTask.serviceDate),
    address: safeTask.address || '',
    assignedTechnician: safeTask.assignedTechnician || '',
    priority: safeTask.priority || 'medium',
    notes: safeTask.notes || '',
    checklistItems: Array.isArray(safeTask.checklistItems)
      ? safeTask.checklistItems.map((item) => ({
          id: item.id,
          label: item.label || '',
          done: Boolean(item.done),
        }))
      : [],
  };
}

export function buildOrderPayload(form) {
  return {
    title: form.title.trim(),
    customerName: form.customerName.trim(),
    customerPhone: form.customerPhone.trim(),
    serviceDate: form.serviceDate ? `${form.serviceDate}T12:00:00.000Z` : '',
    address: form.address.trim(),
    assignedTechnician: form.assignedTechnician.trim(),
    priority: form.priority,
    notes: form.notes.trim(),
    checklistItems: (form.checklistItems || [])
      .map((item) => ({
        id: item.id,
        label: String(item.label || '').trim(),
        done: Boolean(item.done),
      }))
      .filter((item) => item.label),
  };
}
