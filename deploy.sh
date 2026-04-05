#!/bin/bash
set -e

DOMAIN="ideas.erdemcanaz.com"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

# Check .env.production exists
if [ ! -f .env.production ]; then
  echo "ERROR: .env.production not found."
  echo "Copy .env.example to .env.production and fill in your values."
  exit 1
fi

# Check if SSL cert already exists in the volume
CERT_EXISTS=$(docker run --rm -v erdem_certbot_certs:/etc/letsencrypt alpine sh -c "test -f $CERT_PATH && echo yes || echo no" 2>/dev/null || echo "no")

if [ "$CERT_EXISTS" = "yes" ]; then
  echo "==> SSL certificate found. Starting with HTTPS..."
  docker compose up -d --build
  echo "==> Done! Site is live at https://$DOMAIN"
else
  echo "==> No SSL certificate found. Running initial setup..."

  # Prompt for email
  read -rp "Email for Let's Encrypt notifications: " EMAIL
  if [ -z "$EMAIL" ]; then
    echo "ERROR: Email is required for Let's Encrypt."
    exit 1
  fi

  # Start with HTTP-only config
  echo "==> Starting services with HTTP-only config..."
  docker compose -f compose.yaml -f compose.init.yaml up -d --build

  # Wait for nginx to be ready
  echo "==> Waiting for nginx..."
  sleep 3

  # Request certificate (override entrypoint to run certonly directly)
  echo "==> Requesting SSL certificate for $DOMAIN..."
  docker compose run --rm --entrypoint "certbot" certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    --email "$EMAIL" --agree-tos --no-eff-email \
    -d "$DOMAIN"

  # Switch to HTTPS config
  echo "==> Switching to HTTPS config..."
  docker compose -f compose.yaml -f compose.init.yaml down
  docker compose up -d

  echo "==> Done! Site is live at https://$DOMAIN"
fi
