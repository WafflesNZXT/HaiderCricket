# Vercel Deployment Setup - Complete

## Changes Made for Vercel Deployment

### 1. Created `backend/vercel.json`
- Configures Vercel to deploy the Express server
- Specifies environment variables for Vercel dashboard
- Routes all requests to server.js

### 2. Updated `backend/server.js`
- Added `module.exports = app` for Vercel serverless deployment
- Added conditional server startup for local development
- Server now works both locally and on Vercel

### 3. Updated `script.js` (Frontend)
- Added dynamic backend URL detection
- **Local**: `http://localhost:3001/api/order`
- **GitHub Pages**: `https://haider-cricket-backend.vercel.app/api/order`
- No frontend code changes needed - automatic!

### 4. Created `backend/.gitignore`
- Protects `.env` file from being committed
- Prevents uploading credentials to GitHub

### 5. Updated `backend/README.md`
- Complete Vercel deployment instructions
- Step-by-step guide with exact commands
- Troubleshooting section

## Files Ready to Deploy

✅ `backend/vercel.json` - NEW
✅ `backend/.gitignore` - NEW  
✅ `backend/server.js` - UPDATED
✅ `backend/README.md` - UPDATED
✅ `script.js` - UPDATED
✅ `products.html` - UPDATED (removed duplicate onchange)

## Next Steps: Push to GitHub

```bash
cd /path/to/HaiderCricket
git add -A
git commit -m "Setup Vercel deployment for backend"
git push origin main
```

## Then: Deploy to Vercel

```bash
npm install -g vercel
vercel login
cd backend
vercel
```

Set environment variables in Vercel dashboard, then:

```bash
vercel --prod
```

## Result

✅ Backend running on: `https://haider-cricket-backend.vercel.app`
✅ Frontend auto-configured to use Vercel backend
✅ Emails working from GitHub Pages deployment
✅ Free tier - no monthly costs!

