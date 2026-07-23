# 🚀 Quick Deployment Checklist - Hostinger VPS

## Before You Start

- [ ] Purchased Hostinger VPS (4GB+ RAM recommended)
- [ ] Have SSH access to your VPS
- [ ] Domain name pointed to VPS IP

---

## Step-by-Step Quick Guide

### 1️⃣ Connect to VPS
```bash
ssh root@YOUR_VPS_IP
```

### 2️⃣ Run Server Setup Script
```bash
# Download and run setup script
curl -O https://raw.githubusercontent.com/YOUR_REPO/medusa/main/scripts/setup-vps.sh
chmod +x setup-vps.sh
sudo ./setup-vps.sh
```

Or manually install:
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g yarn pm2

# Install PostgreSQL
apt install -y postgresql-14 postgresql-contrib-14

# Install Redis
apt install -y redis-server

# Install Nginx
apt install -y nginx certbot python3-certbot-nginx
```

### 3️⃣ Create Database
```bash
sudo -i -u postgres
createdb marqa_souq_db
createuser --interactive --pwprompt marqa_user
# Enter password when prompted
psql
GRANT ALL PRIVILEGES ON DATABASE marqa_souq_db TO marqa_user;
\c marqa_souq_db
GRANT ALL ON SCHEMA public TO marqa_user;
\q
exit
```

### 4️⃣ Upload Project Files
```bash
# On your LOCAL machine:
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.medusa' \
  /path/to/medusa/ \
  root@YOUR_VPS_IP:/var/www/naema/
```

### 5️⃣ Configure Backend Environment
```bash
cd /var/www/naema/backend/my-medusa-store
cp .env.production.template .env
nano .env
# Update DATABASE_URL, JWT_SECRET, COOKIE_SECRET, CORS settings
```

### 6️⃣ Build & Deploy Backend
```bash
cd /var/www/naema/backend/my-medusa-store
yarn install
yarn build:production
npx medusa db:migrate
```

### 7️⃣ Configure Frontend Environment
```bash
cd /var/www/naema/frontend/Naema-web
cp .env.production.template .env.production.local
nano .env.production.local
# Update NEXT_PUBLIC_MEDUSA_BACKEND_URL
```

### 8️⃣ Build Frontend
```bash
cd /var/www/naema/frontend/Naema-web
yarn install
export NODE_OPTIONS="--max-old-space-size=4096"
yarn build
```

### 9️⃣ Start with PM2
```bash
cd /var/www/naema
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 🔟 Configure Nginx & SSL
```bash
# Copy nginx configs (see main documentation)
sudo certbot --nginx -d api.naema.com
sudo certbot --nginx -d naema.com -d www.naema.com
```

---

## Verification

```bash
# Check services
pm2 status
sudo systemctl status postgresql redis-server nginx

# Test endpoints
curl http://localhost:9000/health
curl http://localhost:3000
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `pm2 status` | Check app status |
| `pm2 logs` | View all logs |
| `pm2 restart all` | Restart apps |
| `pm2 monit` | Monitor resources |
| `sudo nginx -t` | Test nginx config |
| `sudo systemctl reload nginx` | Reload nginx |

---

## Need Help?

📖 Full documentation: `docs/HOSTINGER_VPS_DEPLOYMENT.md`
🔗 MedusaJS Docs: https://docs.medusajs.com/
