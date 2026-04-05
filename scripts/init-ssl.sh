#!/bin/bash
# First-time SSL certificate setup for ideas.erdemcanaz.com
# Run this ONCE on the server after the first deploy.

set -e

DOMAIN="ideas.erdemcanaz.com"
EMAIL="${1:?Usage: ./scripts/init-ssl.sh your@email.com}"

echo "==> Starting with HTTP-only config..."
cp nginx/nginx.init.conf nginx/nginx.active.conf
docker compose up -d app
docker compose run --rm nginx sh -c "cp /dev/null /etc/nginx/conf.d/default.conf"
docker compose up -d nginx

# Use the init config for nginx temporarily
docker compose cp nginx/nginx.init.conf nginx:/etc/nginx/conf.d/default.conf
docker compose exec nginx nginx -s reload

echo "==> Requesting certificate for $DOMAIN..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

echo "==> Switching to full HTTPS config..."
docker compose cp nginx/nginx.conf nginx:/etc/nginx/conf.d/default.conf
docker compose exec nginx nginx -s reload

echo "==> Done! SSL is active for $DOMAIN"
echo "    Certbot will auto-renew via the certbot service."
