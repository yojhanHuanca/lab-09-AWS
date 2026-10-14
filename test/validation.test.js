import test from 'node:test';import assert from 'node:assert/strict';import {validUpload,validKey,magic,MAX} from '../validation.js';
test('Acepta imagen válida',()=>assert.ok(validUpload({filename:'foto.png',contentType:'image/png',sizeBytes:1024})));
test('Bloquea PDF y EXE',()=>{for(const contentType of ['application/pdf','application/octet-stream'])assert.equal(validUpload({filename:'file',contentType,sizeBytes:10}),false)});
test('Bloquea 10MB, 5MB exactos, negativos y tamaño ausente',()=>{for(const sizeBytes of [10*1024*1024,MAX,-1,0,undefined,'123'])assert.equal(validUpload({filename:'a.jpg',contentType:'image/jpeg',sizeBytes}),false)});
test('Limita claves a originales sin traversal',()=>{assert.ok(validKey('originales/foto.jpg'));for(const k of ['otro/a.jpg','originales/../a.jpg','originales/','originales/\\a'])assert.equal(validKey(k),false)});
test('Comprueba firmas reales y rechaza archivo disfrazado',()=>{assert.ok(magic(Buffer.from([255,216,255]),'image/jpeg'));assert.ok(magic(Buffer.from([137,80,78,71,13,10,26,10]),'image/png'));assert.ok(magic(Buffer.from('RIFF0000WEBP'),'image/webp'));assert.equal(magic(Buffer.from('%PDF mentira'),'image/jpeg'),false)});
