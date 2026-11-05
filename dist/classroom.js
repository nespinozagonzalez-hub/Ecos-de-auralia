// Sellos de curso: códigos privados derivados de una clave docente.
// El equipo del estudiante solo recibe huellas (hashes) de los códigos, nunca la clave ni los códigos.
// Es una protección local: dificulta adivinar o fabricar sellos, pero no sustituye una validación en servidor.
import {MISSIONS,REGIONS} from './atlas-data.js';

const K = [
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
];
const W = new Uint32Array(64);

/** SHA-256 síncrono (UTF-8) que devuelve hexadecimal. */
export function sha256(text) {
  const bytes = new TextEncoder().encode(String(text));
  const bitLength = bytes.length * 8;
  const padded = new Uint8Array(((bytes.length + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bitLength / 2 ** 32));
  view.setUint32(padded.length - 4, bitLength >>> 0);
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) W[i] = view.getUint32(offset + i * 4);
    for (let i = 16; i < 64; i++) {
      const a = W[i - 15], b = W[i - 2];
      const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3);
      const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const t1 = (h + S1 + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

// Repetir el hash encarece probar claves o códigos por fuerza bruta.
const KEY_ROUNDS = 4000;
const CODE_ROUNDS = 600;
function stretch(text, rounds) { let h = sha256(text); for (let i = 1; i < rounds; i++) h = sha256(h + text); return h; }

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O ni 1/I para dictar y copiar sin errores
const CODE_LENGTH = 6;
export const MIN_SECRET = 8;

const cleanName = name => String(name || '').trim().replace(/\s+/g, ' ').slice(0, 40);
/** Forma canónica de un código: mayúsculas, sin espacios ni guiones. */
export const canonicalCode = input => String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20);
const prefix = m => REGIONS.find(r => r.id === m.region).code + (m.index + 1);
const readable = canon => canon.slice(0, 4) + '-' + canon.slice(4);

function masterKey(name, secret) {
  const id = sha256('auralia-curso|' + cleanName(name).toLowerCase() + '|' + secret).slice(0, 10);
  return {id, key: stretch('auralia-clave|' + id + '|' + secret, KEY_ROUNDS)};
}
function codeFor(key, mission) {
  const digest = sha256('auralia-sello|' + key + '|' + mission.id);
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i++) out += ALPHABET[parseInt(digest.slice(i * 2, i * 2 + 2), 16) % ALPHABET.length];
  return prefix(mission) + out;
}
const fingerprint = (classId, canon) => stretch('auralia-huella|' + classId + '|' + canon, CODE_ROUNDS).slice(0, 24);
const verifierFor = (classId, key) => sha256('auralia-docente|' + classId + '|' + key).slice(0, 24);

/**
 * Crea (o vuelve a crear, con el mismo nombre y clave) un curso.
 * Devuelve la configuración pública para estudiantes y la lista privada de sellos para el docente.
 */
export function createClassroom(name, secret) {
  const label = cleanName(name);
  if (!label) return {ok: false, message: 'Escribe un nombre para el curso.'};
  if (String(secret || '').length < MIN_SECRET) return {ok: false, message: 'La clave docente necesita al menos ' + MIN_SECRET + ' caracteres.'};
  const {id, key} = masterKey(label, secret);
  const codes = MISSIONS.map(m => ({missionId: m.id, region: m.region, title: m.title, code: readable(codeFor(key, m))}));
  const classroom = {id, name: label, hashes: codes.map(c => fingerprint(id, canonicalCode(c.code))), verifier: verifierFor(id, key)};
  return {ok: true, classroom, codes};
}

/** Comprueba la clave docente contra un curso ya unido y, si es correcta, devuelve sus sellos. */
export function unlockClassroom(classroom, secret) {
  if (!validClassroom(classroom)) return null;
  const result = createClassroom(classroom.name, secret);
  return result.ok && result.classroom.id === classroom.id && result.classroom.verifier === classroom.verifier ? result.codes : null;
}

export function validClassroom(c) {
  return !!c && typeof c === 'object' && /^[0-9a-f]{10}$/.test(c.id) && typeof c.name === 'string' && c.name.length > 0 && c.name.length <= 40 &&
    Array.isArray(c.hashes) && c.hashes.length === MISSIONS.length && c.hashes.every(h => /^[0-9a-f]{24}$/.test(h)) && /^[0-9a-f]{24}$/.test(c.verifier);
}
export const copyClassroom = c => validClassroom(c) ? {id: c.id, name: c.name, hashes: [...c.hashes], verifier: c.verifier} : null;

/** Identifica la misión de un código del curso, o null si no corresponde. */
export function missionForCode(classroom, input) {
  const canon = canonicalCode(input);
  if (!validClassroom(classroom) || canon.length !== 4 + CODE_LENGTH) return null;
  const m = MISSIONS.find(m => prefix(m) === canon.slice(0, 4));
  if (!m) return null;
  return classroom.hashes[MISSIONS.indexOf(m)] === fingerprint(classroom.id, canon) ? {mission: m, code: readable(canon)} : null;
}

// Enlace de curso: la configuración pública viaja en ?curso=... (base64url de JSON).
const b64 = text => { const bin = String.fromCharCode(...new TextEncoder().encode(text)); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64 = text => new TextDecoder().decode(Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));
export function encodeClassroom(c) { return b64(JSON.stringify({v: 1, i: c.id, n: c.name, h: c.hashes.join(''), k: c.verifier})); }
export function decodeClassroom(text) {
  try {
    const raw = JSON.parse(unb64(String(text || '')));
    if (raw.v !== 1 || typeof raw.h !== 'string') return null;
    return copyClassroom({id: raw.i, name: raw.n, hashes: raw.h.match(/.{24}/g) || [], verifier: raw.k});
  } catch { return null; }
}
