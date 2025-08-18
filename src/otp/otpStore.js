// In-memory OTP store: Use Redis in production.
const store = new Map(); // phone -> { code, exp, tries, lastSentAt }

function setOtp(phone, code, ttlSec) {
  const exp = Date.now() + ttlSec * 1000;
  store.set(phone, { code, exp, tries: 0, lastSentAt: Date.now() });
}

function getOtp(phone) {
  const rec = store.get(phone);
  if (!rec) return null;
  if (Date.now() > rec.exp) { store.delete(phone); return null; }
  return rec;
}

function deleteOtp(phone) { store.delete(phone); }

module.exports = { setOtp, getOtp, deleteOtp };
