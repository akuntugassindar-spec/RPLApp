import { mkdirSync, copyFileSync } from 'node:fs';

mkdirSync('dist', { recursive: true });
copyFileSync('index.html', 'dist/index.html');
console.log('Build sukses: dist/index.html siap diterbitkan.');
