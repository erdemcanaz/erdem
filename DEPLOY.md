# Deployment Guide — ideas.erdemcanaz.com

## Prerequisites

- A Linux server with Docker and Docker Compose installed
- DNS A record pointing `ideas.erdemcanaz.com` to your server IP
- SSH access to the server

## 1. Clone & Configure

```bash
git clone <your-repo-url> erdem && cd erdem
cp .env.example .env.production
```

Edit `.env.production`:

```
ADMIN_PASSWORD=your-secure-password
ANTHROPIC_API_KEY=sk-ant-your-key
```

## 2. First Deploy (SSL Certificate Setup)

Start with HTTP-only nginx config so certbot can verify domain ownership:

```bash
# Use the initial HTTP-only config
cp nginx/nginx.init.conf nginx/nginx.active.conf
docker compose up -d --build
```

Override nginx to use the init config temporarily:

```bash
docker compose cp nginx/nginx.init.conf nginx:/etc/nginx/conf.d/default.conf
docker compose exec nginx nginx -s reload
```

Request the SSL certificate:

```bash
docker compose run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email your@email.com --agree-tos --no-eff-email \
  -d ideas.erdemcanaz.com
```

Switch to the full HTTPS config:

```bash
docker compose cp nginx/nginx.conf nginx:/etc/nginx/conf.d/default.conf
docker compose exec nginx nginx -s reload
```

## 3. Subsequent Deploys

```bash
git pull
docker compose up -d --build
```

## 4. Useful Commands

```bash
# View logs
docker compose logs -f app
docker compose logs -f nginx

# Shell into the app container
docker exec -it erdem-app-1 sh

# Force rebuild without cache
docker compose build --no-cache app
docker compose up -d

# Restart a single service
docker compose restart nginx

# Stop everything (data persists)
docker compose down

# Stop everything AND delete data (careful!)
docker compose down -v
```

## Architecture

```
                    ┌──────────┐
  :80/:443  ──────> │  nginx   │ ──────> app:3000 (internal)
                    └──────────┘
                         │
                    ┌──────────┐
                    │ certbot  │  (auto-renews SSL every 12h)
                    └──────────┘

  Data: SQLite in named volume (erdem_app_data)
```

- **app**: Bun + Next.js standalone, port 3000 (not exposed to host)
- **nginx**: Reverse proxy, SSL termination, gzip, static asset caching
- **certbot**: Automatic Let's Encrypt renewal

## Volumes

| Volume | Purpose |
|--------|---------|
| `erdem_app_data` | SQLite database (`/app/data/erdem.db`) |
| `erdem_certbot_www` | ACME challenge files |
| `erdem_certbot_certs` | SSL certificates |
