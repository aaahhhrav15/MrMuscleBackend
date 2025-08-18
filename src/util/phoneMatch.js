// src/util/phoneMatch.js
function onlyDigits(raw = '') { return String(raw).replace(/\D/g, ''); }
function normalize(raw = '') {
  const s = String(raw).trim();
  const d = onlyDigits(s);
  if (!d) return '';
  if (s.startsWith('+')) return '+' + d;        // keep leading +
  if (d.length === 10) return '+91' + d;        // assume India for 10-digit inputs
  return '+91' + d;                              // fallback
}
function tail10(raw = '') { return onlyDigits(raw).slice(-10); }

// Build a tolerant $or matcher across common phone paths and types
function buildPhoneMatcher(input) {
  const norm = normalize(input);
  const last = tail10(input);
  const lastNum = last ? Number(last) : null;

  const paths = [
    'phone',
  ];

  const or = [];

  for (const path of paths) {
    // exact string matches
    or.push({ [path]: norm });
    or.push({ [path]: last });
    // ends-with last 10 (strings only)
    if (last) or.push({ [path]: new RegExp(`${last}$`) });
    // exact numeric match (for docs that stored phone as Number)
    if (!Number.isNaN(lastNum) && lastNum !== null) or.push({ [path]: lastNum });
  }

  // Also accept exact normalized with plus removed (some data stored without '+')
  if (norm.startsWith('+')) {
    const normNoPlus = norm.slice(1);
    for (const path of paths) or.push({ [path]: normNoPlus });
  }

  return { $or: or };
}

module.exports = { onlyDigits, normalize, tail10, buildPhoneMatcher };
