/**
 * Durable file storage backed by MongoDB GridFS.
 *
 * Hosts like Render wipe the local disk on every deploy/restart, so uploaded
 * payment slips, KYC documents, chat files and generated PDFs are stored in
 * MongoDB instead. Files are addressed by a server-relative key such as
 * "uploads/payments/<studentId>/<file>.pdf" — the same paths the app used on
 * disk — and served back at "/<key>".
 *
 * Files that still exist on local disk (older data, local development) are
 * served as a fallback.
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const BUCKET = 'files';
const BACKEND_ROOT = path.join(__dirname, '..', '..');

function bucket() {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');
  return new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET });
}

/** Normalise "/uploads/x" | "uploads/x" | "uploads\\x" to "uploads/x". */
function normaliseKey(key) {
  return String(key || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .split('/')
    .filter((part) => part && part !== '.' && part !== '..')
    .join('/');
}

const MIME = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.txt': 'text/plain',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function guessType(key) {
  return MIME[path.extname(key).toLowerCase()] || 'application/octet-stream';
}

/** Save a Buffer under `key`, replacing any previous file with that key. */
async function saveFile(key, buffer, contentType) {
  const k = normaliseKey(key);
  const b = bucket();
  const existing = await b.find({ filename: k }).toArray();
  await new Promise((resolve, reject) => {
    const up = b.openUploadStream(k, { metadata: { contentType: contentType || guessType(k) } });
    up.on('error', reject);
    up.on('finish', resolve);
    up.end(buffer);
  });
  await Promise.all(existing.map((f) => b.delete(f._id).catch(() => {})));
  return `/${k}`;
}

async function findFile(key) {
  const k = normaliseKey(key);
  const [file] = await bucket().find({ filename: k }).sort({ uploadDate: -1 }).limit(1).toArray();
  return file || null;
}

function diskPath(key) {
  return path.join(BACKEND_ROOT, normaliseKey(key));
}

async function exists(key) {
  if (await findFile(key)) return true;
  const p = diskPath(key);
  return fs.existsSync(p) && fs.statSync(p).isFile();
}

/** Read a whole file into a Buffer, or null if it doesn't exist. */
async function readFile(key) {
  const file = await findFile(key);
  if (file) {
    const chunks = [];
    await new Promise((resolve, reject) => {
      bucket()
        .openDownloadStream(file._id)
        .on('data', (c) => chunks.push(c))
        .on('error', reject)
        .on('end', resolve);
    });
    return Buffer.concat(chunks);
  }
  const p = diskPath(key);
  return fs.existsSync(p) && fs.statSync(p).isFile() ? fs.readFileSync(p) : null;
}

async function deleteFile(key) {
  const k = normaliseKey(key);
  if (!k || !k.includes('/')) return; // never touch the backend root or top-level folders
  const files = await bucket().find({ filename: k }).toArray();
  await Promise.all(files.map((f) => bucket().delete(f._id).catch(() => {})));
  const p = diskPath(k);
  if (fs.existsSync(p) && fs.statSync(p).isFile()) fs.unlinkSync(p);
}

/**
 * Stream a stored file to an Express response.
 * Returns false (without responding) if the file doesn't exist.
 */
async function sendFile(res, key, { downloadName, inline = true } = {}) {
  const k = normaliseKey(key);
  const name = downloadName || path.basename(k);
  const disposition = `${inline ? 'inline' : 'attachment'}; filename="${name.replace(/"/g, '')}"`;
  const file = await findFile(k);
  if (file) {
    res.setHeader('Content-Type', file.metadata?.contentType || guessType(k));
    res.setHeader('Content-Length', file.length);
    res.setHeader('Content-Disposition', disposition);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    await new Promise((resolve, reject) => {
      bucket().openDownloadStream(file._id).on('error', reject).on('end', resolve).pipe(res);
    });
    return true;
  }
  const p = diskPath(k);
  if (k && fs.existsSync(p) && fs.statSync(p).isFile()) {
    res.setHeader('Content-Type', guessType(k));
    res.setHeader('Content-Disposition', disposition);
    await new Promise((resolve, reject) => fs.createReadStream(p).on('error', reject).on('end', resolve).pipe(res));
    return true;
  }
  return false;
}

/** Express middleware: serve GET <mount>/<rest> from the store under key "<prefix>/<rest>". */
function serve(prefix) {
  return async (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    try {
      const key = `${prefix}/${decodeURIComponent(req.path)}`;
      const sent = await sendFile(res, key);
      if (!sent) return res.status(404).json({ success: false, message: 'File not found' });
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { saveFile, readFile, exists, deleteFile, sendFile, serve, normaliseKey };
