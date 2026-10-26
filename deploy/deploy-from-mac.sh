#!/bin/sh
# Deploys docs.replybek.uz to the Hetzner server: builds dist/, copies it over SSH and starts the
# replybek-docs container. Run it from anywhere:
#   ./deploy/deploy-from-mac.sh
# The main Caddy needs the block in deploy/Caddyfile.snippet once.
set -e
SERVER=root@77.42.79.190

cd "$(dirname "$0")/.."
node build.mjs
ssh "$SERVER" 'mkdir -p /opt/replybek-docs/site'
rsync -az --delete --exclude .DS_Store dist/ "$SERVER":/opt/replybek-docs/site/
scp -q deploy/docker-compose.yml "$SERVER":/opt/replybek-docs/docker-compose.yml
ssh "$SERVER" 'cd /opt/replybek-docs && docker compose up -d && sleep 2 && docker exec replybek-docs wget -qO- http://127.0.0.1/ | grep -q "<title>" && echo "deployed"'
