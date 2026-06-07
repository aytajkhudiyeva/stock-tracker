const { randomUUID } = require('crypto');

let alerts = [];

function getAlerts() {
  return alerts;
}

function saveAlert(data) {
  const alert = { id: randomUUID(), createdAt: new Date().toISOString(), ...data };
  alerts.push(alert);
  return alert;
}

function deleteAlert(id) {
  const idx = alerts.findIndex(a => a.id === id);
  if (idx === -1) return null;
  const [removed] = alerts.splice(idx, 1);
  return removed;
}

function updateAlert(id, data) {
  const alert = alerts.find(a => a.id === id);
  if (!alert) return null;
  Object.assign(alert, data);
  return alert;
}

module.exports = { getAlerts, saveAlert, deleteAlert, updateAlert };
