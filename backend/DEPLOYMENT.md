# Deployment & Production Setup Guide

## Pre-Deployment Checklist

### Security
- [ ] Change `JWT_SECRET` to a strong, random string
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for production domain only
- [ ] Enable rate limiting for API endpoints
- [ ] Set up API key protection if needed
- [ ] Audit all dependencies for vulnerabilities (`npm audit`)

### Database
- [ ] Set up MongoDB Atlas with secure credentials
- [ ] Enable IP whitelist in MongoDB
- [ ] Set up database backups
- [ ] Test database connection from production server
- [ ] Create database indexes for better performance
- [ ] Set up monitoring and alerts

### Environment Variables
- [ ] Create `.env` with all required variables
- [ ] Never commit `.env` to version control
- [ ] Use a secrets manager in production
- [ ] Rotate secrets periodically

### Code
- [ ] Run all tests
- [ ] Check for console logs (remove debugging code)
- [ ] Verify all error handlers are in place
- [ ] Review all API responses for sensitive data
- [ ] Check for hardcoded credentials

## Production Environment Variables

Create `.env` for production:
```
MONGODB_URI=mongodb+srv://produser:STRONG_PASSWORD@cluster.mongodb.net/smash_and_heal_prod
PORT=5000
JWT_SECRET=your_super_secret_production_key_64_characters_minimum
JWT_EXPIRE=7d
NODE_ENV=production
MPESA_CONSUMER_KEY=prod_key
MPESA_CONSUMER_SECRET=prod_secret
MPESA_SHORTCODE=prod_shortcode
MPESA_PASSKEY=prod_passkey
```

## Deployment Options

### Option 1: Heroku

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Create Heroku app:**
   ```bash
   heroku create smash-and-heal-api
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_secret
   heroku config:set NODE_ENV=production
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **View logs:**
   ```bash
   heroku logs --tail
   ```

### Option 2: Railway.app

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Connect project:**
   ```bash
   railway init
   ```

4. **Add MongoDB plugin from Railway dashboard

5. **Deploy:**
   ```bash
   railway up
   ```

### Option 3: Render

1. **Connect GitHub repository**
2. **Create new Web Service:**
   - Select GitHub repo
   - Build command: `npm install`
   - Start command: `npm start`
3. **Add environment variables**
4. **Deploy automatically on push**

### Option 4: AWS EC2

1. **Launch EC2 instance:**
   - Ubuntu 20.04 LTS
   - Security group: allow ports 80, 443, 5000

2. **SSH into instance:**
   ```bash
   ssh -i key.pem ubuntu@your-instance-ip
   ```

3. **Install Node.js:**
   ```bash
   curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2 (process manager):**
   ```bash
   sudo npm install -g pm2
   ```

5. **Clone repository:**
   ```bash
   git clone your-repo-url
   cd smash-and-heal/backend
   ```

6. **Install dependencies:**
   ```bash
   npm install --production
   ```

7. **Create `.env` file:**
   ```bash
   nano .env
   # Add all environment variables
   ```

8. **Start with PM2:**
   ```bash
   pm2 start server.js --name smash-and-heal
   pm2 save
   pm2 startup
   ```

9. **Set up Nginx reverse proxy:**
   ```bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/default
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name api.smashandhealmh.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **Enable SSL with Certbot:**
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d api.smashandhealmh.com
    ```

### Option 5: DigitalOcean App Platform

1. **Push code to GitHub**
2. **Create new App in DigitalOcean:**
   - Select GitHub repo
   - Select `backend` directory
   - Configure environment variables
3. **DigitalOcean handles deployment**

## Performance Optimization

### 1. Enable Caching
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache resources
router.get('/resources', async (req, res) => {
  const cacheKey = 'resources_all';
  const cached = await client.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const resources = await Resource.find();
  await client.setex(cacheKey, 3600, JSON.stringify(resources));
  res.json({ resources });
});
```

### 2. Database Indexing
```javascript
// Already added in models, but verify:
// In Booking model:
bookingSchema.index({ user: 1, createdAt: -1 });

// In Resource model:
resourceSchema.index({ category: 1, isPublished: 1 });
resourceSchema.index({ tags: 1 });
```

### 3. Pagination
```javascript
exports.getAllResources = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;
  
  const resources = await Resource.find()
    .limit(limit)
    .skip(skip);
  
  res.json({ resources, page, limit });
};
```

### 4. Compression
```javascript
const compression = require('compression');
app.use(compression());
```

### 5. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Monitoring & Logging

### Winston Logger Setup
```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'smash-and-heal' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Use in middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
```

### Application Performance Monitoring
- Use New Relic
- Use Datadog
- Use Scout
- Monitor response times, error rates, database queries

## Backup Strategy

### MongoDB Atlas Automated Backups
- Enable in MongoDB Atlas dashboard
- Configure backup frequency (daily)
- Test restore procedures

### Manual Backups
```bash
# Export database
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/smash_and_heal" --out ./backup

# Import database
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/smash_and_heal" ./backup
```

## Scaling Strategy

### Horizontal Scaling
1. Load balancer (Nginx, HAProxy, or cloud provider)
2. Multiple API instances
3. Shared database (MongoDB Atlas)
4. Session storage (Redis)

### Vertical Scaling
1. Increase server resources (CPU, RAM)
2. Optimize database queries
3. Add caching layer

### Database Scaling
1. Enable MongoDB sharding for large datasets
2. Archive old data to cold storage
3. Implement read replicas

## Security Headers

Add to `server.js`:
```javascript
const helmet = require('helmet');
app.use(helmet());

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## SSL/TLS Certificate

### Using Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d api.smashandhealmh.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Update Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name api.smashandhealmh.com;

    ssl_certificate /etc/letsencrypt/live/api.smashandhealmh.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.smashandhealmh.com/privkey.pem;

    # Rest of config...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.smashandhealmh.com;
    return 301 https://$server_name$request_uri;
}
```

## Continuous Integration/Deployment

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: npm install
        working-directory: ./backend
      
      - name: Run tests
        run: npm test
        working-directory: ./backend
      
      - name: Deploy to Heroku
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
        run: |
          git push https://heroku:$HEROKU_API_KEY@git.heroku.com/smash-and-heal-api.git main
```

## Troubleshooting Production Issues

### API Not Responding
1. Check server status: `pm2 status`
2. Restart: `pm2 restart smash-and-heal`
3. Check logs: `pm2 logs smash-and-heal`

### Database Connection Issues
1. Verify MONGODB_URI in .env
2. Check IP whitelist in MongoDB Atlas
3. Test connection: `mongo "mongodb+srv://..."`

### High Memory Usage
1. Check for memory leaks
2. Implement garbage collection monitoring
3. Scale vertically or horizontally

### Slow API Responses
1. Profile database queries
2. Add indexes
3. Implement caching
4. Check server resources

### SSL Certificate Issues
1. Check expiration: `certbot certificates`
2. Renew manually: `sudo certbot renew`
3. Check Nginx config: `sudo nginx -t`

## Regular Maintenance

### Weekly
- Monitor error logs
- Check server resources
- Verify backups

### Monthly
- Update dependencies: `npm outdated`
- Review security logs
- Test disaster recovery procedures

### Quarterly
- Full security audit
- Performance optimization review
- Database maintenance
- Update SSL certificates

## Support Resources

- Node.js Docs: https://nodejs.org/docs/
- Express.js Docs: https://expressjs.com/
- MongoDB Docs: https://docs.mongodb.com/
- Mongoose Docs: https://mongoosejs.com/
- Heroku Docs: https://devcenter.heroku.com/
- Let's Encrypt: https://letsencrypt.org/

## Post-Deployment Verification

1. **Health check:**
   ```bash
   curl https://api.smashandhealmh.com/api/health
   ```

2. **Test registration:**
   ```bash
   curl -X POST https://api.smashandhealmh.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","password":"test123"}'
   ```

3. **Test protected endpoint:**
   ```bash
   curl -H "Authorization: Bearer TOKEN" https://api.smashandhealmh.com/api/auth/profile
   ```

4. **Monitor logs:**
   - Heroku: `heroku logs --tail`
   - AWS/EC2: `pm2 logs`
   - Check error rates and response times

---

For additional support, refer to the main README.md and API documentation.
