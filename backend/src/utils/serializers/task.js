/* eslint-env node */
function serializeChecklistItem(item = {}) {
  return {
    id: String(item._id || item.id || ''),
    label: item.label || '',
    done: Boolean(item.done),
  };
}

function serializeProofPhoto(photo = null) {
  if (!photo?.uri) {
    return null;
  }

  return {
    uri: photo.uri || '',
    capturedAt: photo.capturedAt || null,
    source: photo.source || 'camera',
    mimeType: photo.mimeType || 'image/jpeg',
  };
}

function serializeTask(taskDocument) {
  const task = typeof taskDocument.toObject === 'function'
    ? taskDocument.toObject({ versionKey: false })
    : taskDocument;

  const title = task.title || task.text || '';
  const status = task.status || (task.completed ? 'done' : 'pending');

  return {
    id: String(task._id || task.id || ''),
    title,
    text: title,
    notes: task.notes || '',
    status,
    priority: task.priority || 'medium',
    completed: status === 'done',
    serviceDate: task.serviceDate || null,
    customerName: task.customerName || '',
    customerPhone: task.customerPhone || '',
    address: task.address || '',
    proofPhoto: serializeProofPhoto(task.proofPhoto),
    checklistItems: Array.isArray(task.checklistItems)
      ? task.checklistItems.map(serializeChecklistItem)
      : [],
    createdAt: task.createdAt || null,
    updatedAt: task.updatedAt || null,
  };
}

module.exports = serializeTask;
