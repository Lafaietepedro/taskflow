export function formatDate(serviceDate) {
  if (!serviceDate) {
    return 'Sem data';
  }

  const [year, month, day] = String(serviceDate).slice(0, 10).split('-').map(Number);
  const parsedDate = new Date(year, (month || 1) - 1, day || 1);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data inválida';
  }

  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(parsedDate);
}

export function formatDateTime(dateValue) {
  if (!dateValue) {
    return 'Sem sincronização';
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Horário inválido';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsedDate);
}

export function buildSearchText(order) {
  return [
    order.title,
    order.customerName,
    order.customerPhone,
    order.address,
    order.notes,
    ...(order.checklistItems || []).map((item) => item.label),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function buildTaskPayload(order) {
  return {
    title: String(order.title || '').trim(),
    customerName: String(order.customerName || '').trim(),
    customerPhone: String(order.customerPhone || '').trim(),
    serviceDate: order.serviceDate ? `${String(order.serviceDate).slice(0, 10)}T12:00:00.000Z` : '',
    address: String(order.address || '').trim(),
    priority: order.priority || 'medium',
    notes: String(order.notes || '').trim(),
    checklistItems: (order.checklistItems || []).map((item) => ({
      id: item.id,
      label: String(item.label || '').trim(),
      done: Boolean(item.done),
    })).filter((item) => item.label),
    proofPhoto: order.proofPhoto?.uri ? {
      uri: order.proofPhoto.uri,
      capturedAt: order.proofPhoto.capturedAt || new Date().toISOString(),
      source: order.proofPhoto.source || 'camera',
      mimeType: order.proofPhoto.mimeType || 'image/jpeg',
    } : null,
  };
}
