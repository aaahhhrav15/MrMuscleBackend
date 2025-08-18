// src/util/phone.js
exports.onlyDigits = (raw='') => String(raw).replace(/\D/g, '');
exports.normalize = (raw='') => {
  const d = exports.onlyDigits(raw);
  if (!d) return '';
  if (String(raw).trim().startsWith('+')) return '+' + d;
  if (d.length === 10) return '+91' + d;
  return '+91' + d;
};
exports.tail10 = (raw='') => exports.onlyDigits(raw).slice(-10);
