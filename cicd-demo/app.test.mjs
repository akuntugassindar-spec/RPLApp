import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('judul reservasi tersedia', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.ok(html.includes('<h1>Reservasi Ruang</h1>'));
});
