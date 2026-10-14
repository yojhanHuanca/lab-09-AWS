# Lumen Gallery — Lab 09 AWS

Galería de imágenes privada con **presigned URLs** (Express + AWS SDK v3). El navegador sube/descarga directamente a S3; el backend solo firma URLs temporales.

## Demo

[![Lumen Gallery Demo](https://img.youtube.com/vi/ug-LJSuGXh8/maxresdefault.jpg)](https://youtu.be/ug-LJSuGXh8)

> Click en la imagen para ver el video en YouTube

## Stack

- **Backend**: Node 22, Express 5, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- **Frontend**: Vanilla JS (ESM), CSS custom properties
- **Tests**: `node:test`

## Requisitos

- Node.js ≥ 22
- Cuenta AWS con bucket S3 privado
- Credenciales configuradas (perfil local o `.env`)

## Configuración

```bash
cd "C:\Users\USER\OneDrive\Documentos\ChatGPT\lab-02\semana 9"
cp .env.example .env
# Edita .env con tu bucket y región
npm install
```

### `.env`

```env
S3_BUCKET=tu-bucket
AWS_REGION=us-east-1
PORT=3009
APP_URL=http://localhost:3009
```

### CORS del bucket (Permissions → CORS)

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": ["http://localhost:3009"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Ejecutar

```bash
npm start      # producción
npm run dev    # --watch
npm test       # pruebas
```

Abre **http://localhost:3009**

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/upload-url` | Genera presigned PUT (5 min) |
| POST | `/api/uploads/complete` | Verifica magia/tamaño tras subir |
| GET | `/api/images` | Lista imágenes con presigned GET (15 min) |
| GET | `/api/download?key=` | Presigned GET para descarga (5 min) |
| DELETE | `/api/images/:key` | Elimina objeto |

## Validaciones

- **Frontend**: tipo (JPG/PNG/WebP), tamaño (< 5 MB)
- **Backend**: mismo + magic bytes (JPEG: `FF D8 FF`, PNG: `89 50 4E 47 0D 0A 1A 0A`, WebP: `RIFF....WEBP`)
- **Seguridad**: rate limit 30 req/min/IP, CSP, CORS origin check, sanitización de nombres, sin credenciales en cliente

## Arquitectura

```
Navegador → POST /api/upload-url → Backend → Presigned PUT URL
Navegador → PUT directo a S3 (archivo nunca pasa por backend)
```

## IAM Role para EC2 (sin credenciales en .env)

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject","s3:GetObject","s3:DeleteObject","s3:ListBucket"],
    "Resource": ["arn:aws:s3:::tu-bucket","arn:aws:s3:::tu-bucket/originales/*"]
  }]
}
```
Adjunta el role a la instancia EC2. El SDK usa IMDSv2 automáticamente.

## Pruebas obligatorias

1. Subir JPG válida → aparece en galería
2. Intentar PDF/EXE → bloqueado en frontend
3. Enviar 10 MB a `/api/upload-url` → 400 backend
4. Abrir URL de vista a los 16 min → expirada
5. Inspeccionar Network → PUT va a `*.amazonaws.com`, no al backend
6. Verificar que no hay credenciales AWS en `public/`

## Licencia

MIT