export const MAX=5*1024*1024;
export const TYPES=['image/jpeg','image/png','image/webp'];
export function validUpload(v){return v && typeof v.filename==='string' && v.filename.length>0 && v.filename.length<=180 && TYPES.includes(v.contentType) && Number.isSafeInteger(v.sizeBytes) && v.sizeBytes>0 && v.sizeBytes<MAX;}
export function validKey(k){return typeof k==='string' && k.startsWith('originales/') && !k.includes('..') && !k.includes('\\') && !k.endsWith('/') && k.length<1024;}
export function magic(b,t){return t==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:t==='image/png'?b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):t==='image/webp'?b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP':false;}
