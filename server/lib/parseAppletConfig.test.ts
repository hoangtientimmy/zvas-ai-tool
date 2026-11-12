import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAppletConfig } from './parseAppletConfig';

test('JSON chuẩn', () => {
  const c = parseAppletConfig('{"projectId":"p","apiKey":"k","firestoreDatabaseId":"db"}');
  assert.equal(c.projectId, 'p');
  assert.equal(c.firestoreDatabaseId, 'db');
});

test('ngoặc kép cong “ ”', () => {
  const c = parseAppletConfig('{\n  “apiKey”: “AIza-x”,\n  “projectId”: “p”\n}');
  assert.equal(c.apiKey, 'AIza-x');
  assert.equal(c.firestoreDatabaseId, '(default)');
});

test('nguyên đoạn code Firebase Console', () => {
  const snippet = `// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIza-x",
  authDomain: "p.firebaseapp.com",
  projectId: 'p',
  storageBucket: "p.firebasestorage.app", // comment {
  appId: "1:2:web:3",
};
const app = initializeApp(firebaseConfig);`;
  const c = parseAppletConfig(snippet);
  assert.equal(c.projectId, 'p');
  assert.equal(c.authDomain, 'p.firebaseapp.com');
  assert.equal(c.storageBucket, 'p.firebasestorage.app');
});

test('thiếu projectId → lỗi rõ ràng', () => {
  assert.throws(() => parseAppletConfig('{"apiKey":"k"}'), /projectId/);
});
