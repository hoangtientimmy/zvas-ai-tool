import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'crypto';
import { parseServiceAccount } from './parseServiceAccount';

const pem = generateKeyPairSync('rsa', { modulusLength: 1024 }).privateKey
  .export({ type: 'pkcs8', format: 'pem' })
  .toString();
const sa = { type: 'service_account', project_id: 'demo', client_email: 'a@demo.iam.gserviceaccount.com', private_key: pem };
const json = JSON.stringify(sa);

test('JSON chuẩn', () => {
  const r = parseServiceAccount(json);
  assert.equal(r.projectId, 'demo');
  assert.equal(r.privateKey, pem);
});

test('base64', () => {
  assert.equal(parseServiceAccount(Buffer.from(json).toString('base64')).privateKey, pem);
});

test('ngoặc kép cong', () => {
  const curly = json.replace(/"/g, (_m, i: number) => (json.slice(0, i).split('"').length % 2 ? '“' : '”'));
  assert.equal(parseServiceAccount(curly).clientEmail, sa.client_email);
});

test('private_key bị escape 2 lần', () => {
  const doubled = JSON.stringify({ ...sa, private_key: pem.replace(/\n/g, '\\n') });
  assert.equal(parseServiceAccount(doubled).privateKey, pem);
});

test('thiếu private_key → lỗi rõ', () => {
  assert.throws(() => parseServiceAccount('{"project_id":"x","client_email":"y"}'), /private_key/);
});
