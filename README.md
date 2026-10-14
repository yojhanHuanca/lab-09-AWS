# Lumen Gallery Semana 9

Galería local del ejercicio 4. Express y AWS SDK v3 generan URLs prefirmadas; el navegador envía cada imagen directamente a S3.

## Ejecutar

Requiere Node.js 22 o superior. En PowerShell:

```powershell
cd "C:\Users\USER\OneDrive\Documentos\ChatGPT\lab-02\semana 9"
npm install
npm start
```

Abrir http://localhost:3009. Para desarrollo: `npm run dev`. Para pruebas: `npm test`.

## AWS

El `.env` local ya contiene región us-east-1 y bucket lab-09-yhuanca-20261014. Las credenciales se resuelven mediante el perfil AWS local o variables del servidor; nunca están en public/. Para otro equipo copia `.env.example` a `.env`. Si usas un perfil distinto del predeterminado, configura `AWS_PROFILE`. AWS Academy también requiere `AWS_SESSION_TOKEN` vigente.

La identidad necesita ListBucket para el bucket, GetObject/PutObject/DeleteObject para originales/*. HeadObject utiliza GetObject. No necesita s3:* ni acceso público. Mantén Block Public Access, SSE-S3 y la política que exige HTTPS.

En Permissions → CORS del bucket, agregar o combinar esta regla con las existentes:

```json
[{"AllowedHeaders":["content-type","x-amz-*"],"AllowedMethods":["PUT","GET","HEAD"],"AllowedOrigins":["http://localhost:3009"],"ExposeHeaders":["ETag"],"MaxAgeSeconds":300}]
```

## Funciones y endpoints

- POST /api/upload-url: nombre, contentType y sizeBytes; URL PUT de 5 minutos. Solo JPG, PNG, WebP con 0 < tamaño < 5 MiB. Firma tipo y longitud.
- POST /api/uploads/complete: ticket de carga; comprueba tamaño y ContentType mediante HeadObject y magic bytes con lectura parcial. Retira cargas inválidas mediante DeleteObject (con versionado, las versiones siguen conservadas en S3).
- GET /api/images: listado paginado de originales/ con URLs de 15 minutos. Omite carpetas, extensiones ajenas y objetos diminutos; objetos previos al proyecto no se analizan íntegramente al listar.
- GET /api/download?key=...: descarga directa privada con URL de 5 minutos.
- DELETE /api/images/:key: clave codificada con encodeURIComponent; eliminación recuperable si S3 tiene versionado.
- Vista previa ampliada, descarga, filtros, búsqueda, ordenamiento, selección múltiple, arrastrar y soltar y progreso de subida.

## Pruebas para el entregable

1. Subir JPG válida y verificar vista previa y descarga.
2. Intentar PDF o EXE: bloqueo en frontend.
3. Enviar sizeBytes de 10485760 a /api/upload-url: respuesta 400 del servidor.
4. Abrir una URL de visualización después de 16 minutos: comprobar expiración real.
5. Inspeccionar public/ y solicitudes: no contienen credenciales AWS; la URL prefirmada contiene una autorización temporal, no la clave secreta.
6. En Network comprobar PUT al dominio S3 y POST pequeños al backend.

## Límites

Aplicación para uso local, enlazada a 127.0.0.1. No se debe exponer en internet sin autenticación y autorización de usuarios. El límite de escritura es 30 solicitudes por minuto e IP; los tickets de validación son temporales y viven en memoria. La validación de firma de archivo no sustituye antivirus ni decodificación completa. No compartir URLs prefirmadas. No publicar .env ni ~/.aws/credentials. Las transiciones lifecycle y la recuperación del ejercicio 3 se configuran en AWS, no desde esta galería.
