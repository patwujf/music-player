/**
 * 扫描 music/ 目录，自动生成 songs.json
 * 
 * 用法：在 music-player 目录下运行
 *   node build-songs.js
 * 
 * 加完新 MP3 后跑一次，歌单就更新了。
 */

const fs = require('fs');
const path = require('path');

const musicDir = path.join(__dirname, 'music');
const outputFile = path.join(__dirname, 'songs.json');

if (!fs.existsSync(musicDir)) {
  console.error('❌ 找不到 music/ 目录');
  process.exit(1);
}

const files = fs.readdirSync(musicDir)
  .filter(f => f.toLowerCase().endsWith('.mp3'))
  .sort();

if (files.length === 0) {
  console.log('⚠️ music/ 目录中没有 MP3 文件');
}

fs.writeFileSync(outputFile, JSON.stringify(files, null, 2) + '\n');
console.log(`✅ songs.json 已更新（${files.length} 首）`);
