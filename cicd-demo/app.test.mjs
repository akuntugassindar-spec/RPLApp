import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('judul layanan optikexpress tersedia', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.ok(html.includes('<h1>OptikExpress</h1>'), 'Judul <h1>OptikExpress</h1> harus ada di halaman web');
  assert.ok(html.includes('Versi 2'), 'Versi 2 harus ada di halaman web');
});
