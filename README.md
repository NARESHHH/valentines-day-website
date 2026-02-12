# Valentine's Day Link Generator

Free Valentine page generator where users create a page and get a unique shareable link.

## Run locally (development)

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Use local values in `.env`:

```env
NODE_ENV=development
PORT=3000
APP_BASE_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
DATA_ENCRYPTION_KEY=dev-encryption-key-change-me-1234
IMAGE_STORAGE_PROVIDER=local
```

4. Start app:

```bash
npm run dev
```

## Production-ready setup checklist

- Set `NODE_ENV=production`.
- Set a strong `DATA_ENCRYPTION_KEY` (at least 16 chars, random).
- Set `APP_BASE_URL` to your real domain.
- Set `ALLOWED_ORIGINS` to your frontend domains (comma-separated).
- Choose image storage:
  - `IMAGE_STORAGE_PROVIDER=cloudinary` (recommended for stateless deploys), or
  - `IMAGE_STORAGE_PROVIDER=local` with persistent disk mounted to `/app/data`.

## Deploy with Docker

1. Build image:

```bash
docker build -t valentine-app .
```

2. Run container:

```bash
docker run --name valentine-app \
  --env-file .env \
  -e NODE_ENV=production \
  -p 3000:3000 \
  -v "$(pwd)/data:/app/data" \
  --restart unless-stopped \
  valentine-app
```

3. Or with compose:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## Deploy to cloud (recommended pattern)

1. Push this folder to GitHub.
2. Create a Web Service on Render/Railway/Fly.
3. Set start command: `node server/index.js`.
4. Set env vars from `.env.example`.
5. If using `IMAGE_STORAGE_PROVIDER=local`, attach persistent volume for `/app/data`.
6. Prefer `IMAGE_STORAGE_PROVIDER=cloudinary` to avoid local disk dependency.

## Production smoke test in local machine

```bash
NODE_ENV=production npm run start
curl http://localhost:3000/healthz
```

## API

- `POST /api/create-link` create share link
- `GET /api/valentine/:token` fetch payload by token
- `GET /healthz` liveness
- `GET /readyz` readiness

## Sample preview

- Open `/?sample=1` to view a demo Valentine flow before generating a real link.

## Storage

- DB file: `data/app.db.json` (or `DB_FILE` env)
- Uploaded images: `data/uploads/` (or `UPLOAD_DIR` env)

## Security

- Link payloads are encrypted at rest.
- CSP, CORS allowlist, request size limit, and rate limiting are enabled.
- In production, app fails fast if required security env vars are missing.
