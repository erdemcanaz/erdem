# Deployment Guide — ideas.erdemcanaz.com

## Prerequisites

- A Linux server with Docker and Docker Compose installed
- DNS A record pointing `ideas.erdemcanaz.com` to your server IP

## Deploy

```bash
git clone <your-repo-url> erdem && cd erdem
cp .env.example .env.production
# Edit .env.production with your ADMIN_PASSWORD and ANTHROPIC_API_KEY

chmod +x deploy.sh
./deploy.sh
```

The script handles everything automatically:
- **First run**: starts HTTP-only, requests SSL certificate via Let's Encrypt, switches to HTTPS
- **Subsequent runs**: detects existing certificate and starts with HTTPS directly

## Useful Commands

```bash
docker compose logs -f app        # App logs
docker compose logs -f nginx      # Nginx logs
docker compose restart nginx      # Restart nginx
docker compose down               # Stop (data persists)
docker compose down -v            # Stop + delete all data
```

## Architecture

```
  :80/:443  ──>  nginx  ──>  app:3000 (internal)
                   │
                certbot  (auto-renews SSL every 12h)
```

## Volumes

| Volume | Purpose |
|--------|---------|
| `erdem_app_data` | SQLite database |
| `erdem_certbot_www` | ACME challenge files |
| `erdem_certbot_certs` | SSL certificates |
