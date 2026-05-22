const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MUSIC_DIR = path.join(__dirname, 'music');
const INDEX_PATH = path.join(__dirname, 'index.html');

// Ensure music directory exists
if (!fs.existsSync(MUSIC_DIR)) {
  fs.mkdirSync(MUSIC_DIR, { recursive: true });
}

function getMp3Files() {
  try {
    const files = fs.readdirSync(MUSIC_DIR);
    return files.filter(f => f.toLowerCase().endsWith('.mp3')).sort();
  } catch {
    return [];
  }
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // ── API: 随机选歌 ──
  if (pathname === '/api/random-song') {
    const songs = getMp3Files();
    if (songs.length === 0) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: null, name: null }));
      return;
    }
    const song = songs[Math.floor(Math.random() * songs.length)];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url: `/music/${encodeURIComponent(song)}`, name: song }));
    return;
  }

  // ── API: 歌曲列表（可选） ──
  if (pathname === '/api/songs') {
    const songs = getMp3Files();
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(songs));
    return;
  }

  // ── 提供音乐文件 ──
  if (pathname.startsWith('/music/')) {
    const decoded = decodeURIComponent(pathname.slice(7));
    const filePath = path.resolve(MUSIC_DIR, decoded);

    // 防止路径穿越
    if (!filePath.startsWith(MUSIC_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === '.mp3' ? 'audio/mpeg'
               : ext === '.ogg' ? 'audio/ogg'
               : ext === '.wav' ? 'audio/wav'
               : 'application/octet-stream';

    const stat = fs.statSync(filePath, { throwIfNoEntry: false });
    if (!stat || !stat.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': mime,
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes',
    });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('error', () => {
      res.writeHead(500);
      res.end('Server Error');
    });
    return;
  }

  // ── 提供 index.html ──
  if (pathname === '/' || pathname === '/index.html') {
    fs.readFile(INDEX_PATH, 'utf-8', (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
    return;
  }

  // ── 404 ──
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  🎵  Music Player  🎵');
  console.log('');
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → Music folder: ${MUSIC_DIR}`);
  console.log('');
  console.log(`  Found ${getMp3Files().length} MP3 file(s)`);
  console.log('');
});
