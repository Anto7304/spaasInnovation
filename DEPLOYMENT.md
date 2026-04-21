# Deployment Guide - Smash&Heal

## Project Structure Overview

The Smash&Heal application is organized into two independent deployable units:

```
smash-and-heal/
├── backend/           # Backend API (Node.js/Express/MongoDB)
├── frontend/          # Frontend App (HTML/CSS/JS)
└── package.json       # Root configuration for both services
```

## Deployment Steps

### Phase 1: Environment Setup

#### Prerequisites
- Node.js 14+ and npm
- MongoDB 4.4+
- 2GB RAM minimum
- Port 5000 (backend) and 8000 (frontend) available

#### System Setup
```bash
# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB (if not installed)
sudo apt-get install -y mongodb

# Clone repository
git clone <repository-url> && cd smash-and-heal
```

### Phase 2: Database Setup

#### Local Development
```bash
# Start MongoDB locally
mkdir -p /tmp/mongodb
mongod --dbpath /tmp/mongodb --logpath /tmp/mongodb.log --fork
```

#### Production (MongoDB Atlas)
```bash
# Create .env in backend directory with:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smash_and_heal
```

### Phase 3: Backend Deployment

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment
# Edit .env with your values:
# - MONGODB_URI
# - JWT_SECRET (use strong random string)
# - PORT=5000
# - NODE_ENV=production

# Start backend
npm start

# Backend should be running at http://localhost:5000
```

### Phase 4: Frontend Deployment

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Start frontend server
npm start

# Frontend should be running at http://localhost:8000
```

### Phase 5: Verification

```bash
# Check backend API
curl http://localhost:5000/api/health

# Check frontend
curl http://localhost:8000

# Test user registration (optional)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

## Docker Deployment (Optional)

### Create Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Create Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g serve && npm ci

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: smash_and_heal

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/smash_and_heal
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    depends_on:
      - mongodb
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "8000:8000"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongo_data:
```

#### Deploy with Docker Compose
```bash
docker-compose up -d
```

## Process Management (Production)

### Using PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start npm --name "smash-heal-backend" -- start

# Start frontend with PM2
cd ../frontend
pm2 start npm --name "smash-heal-frontend" -- start

# View logs
pm2 logs

# Monitor
pm2 monit

# Save config for restart
pm2 save
pm2 startup
```

### Using systemd (Linux)

#### Backend Service
```ini
# /etc/systemd/system/smash-heal-backend.service
[Unit]
Description=Smash&Heal Backend API
After=network.target mongodb.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/smash-heal/backend
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Frontend Service
```ini
# /etc/systemd/system/smash-heal-frontend.service
[Unit]
Description=Smash&Heal Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/smash-heal/frontend
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Enable Services
```bash
sudo systemctl daemon-reload
sudo systemctl enable smash-heal-backend.service
sudo systemctl enable smash-heal-frontend.service
sudo systemctl start smash-heal-backend.service
sudo systemctl start smash-heal-frontend.service
```

## Nginx Reverse Proxy (Production)

```nginx
# /etc/nginx/sites-available/smash-heal
server {
    listen 80;
    server_name smash-heal.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name smash-heal.example.com;

    ssl_certificate /etc/letsencrypt/live/smash-heal.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/smash-heal.example.com/privkey.pem;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/smash_and_heal
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smash_and_heal

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=production

# M-PESA (Optional)
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
MPESA_BUSINESS_SHORTCODE=123456
MPESA_PASSKEY=your_passkey
```

### Frontend (No .env needed - uses API_URL in code)
```javascript
// frontend/assets/js/auth.js
const API_URL = 'http://localhost:5000/api';
// Change to production URL when deployed
```

## Backup Strategy

### MongoDB Backup
```bash
# Manual backup
mongodump --out backup/$(date +%Y%m%d)

# Automated backup (cron job)
# 0 2 * * * mongodump --out /backup/mongo/$(date +\%Y\%m\%d)
```

### Database Indexes
```javascript
// Ensure indexes exist for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.bookings.createIndex({ user: 1, createdAt: -1 });
db.resources.createIndex({ category: 1, isPublished: 1 });
```

## Monitoring & Maintenance

### Check Service Status
```bash
# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:8000

# MongoDB
mongosh --eval "db.adminCommand('ping')"
```

### View Logs
```bash
# Backend (if using PM2)
pm2 logs smash-heal-backend

# Frontend (if using PM2)
pm2 logs smash-heal-frontend

# MongoDB (if using systemd)
sudo journalctl -u mongod -f
```

### Performance Optimization
- Enable compression in Nginx
- Use MongoDB connection pooling
- Implement caching headers for static files
- Monitor memory usage with `pm2 monit`

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Database Connection Error
```bash
# Verify MongoDB is running
ps aux | grep mongod

# Check connection string in .env
# Verify MONGODB_URI is correct
```

### CORS Issues
- Check API_URL in frontend JavaScript
- Ensure backend has CORS enabled
- Verify domain is allowed in CORS config

## Rollback Procedure

```bash
# Stop services
pm2 stop all

# Revert to previous version
git checkout <previous-commit>

# Reinstall dependencies
npm install

# Start services
pm2 start all
```

## Support

For deployment issues, check:
1. Backend logs: `pm2 logs`
2. Frontend browser console
3. MongoDB logs: `mongosh --eval "db.currentOp()"`
4. Nginx logs: `/var/log/nginx/error.log`