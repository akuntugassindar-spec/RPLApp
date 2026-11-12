import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('judul dan komponen landing page optikexpress tersedia', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.ok(html.includes('OptikExpress'), 'Brand OptikExpress harus ada di halaman');
  assert.ok(html.includes('Layanan Antar-Jemput Kacamata Praktis & Cepat'), 'Hero title harus sesuai');
  assert.ok(html.includes('Kenapa Memilih Layanan Kami?'), 'Section fitur harus ada');
  assert.ok(html.includes('Versi 2'), 'Label Versi 2 harus ada untuk pembuktian CI/CD');
});
