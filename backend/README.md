# Haider Cricket Backend - Email Service on Vercel

Express.js backend for handling cricket jersey quote requests and sending emails with designs.

## Quick Start for Vercel Deployment

This backend is configured for **free deployment on Vercel**. Follow the steps below.

## Local Development

```bash
npm install
npm start
```

Server runs on `http://localhost:3001`

## 🚀 Deploy to Vercel (Free) - EXACT STEPS

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```
This opens a browser to authenticate with your GitHub account.

### Step 3: Deploy
```bash
cd backend
vercel
```

When asked:
- "Set up and deploy?" → **Y**
- "Which scope?" → Select your account
- "Link to existing project?" → **N**
- "Project name?" → `haider-cricket-backend`
- "Which directory?" → `.` (current)
- "Detected framework?" → **Other**
- "Want to override settings?" → **N**

**Save this URL from the output:**
```
https://haider-cricket-backend.vercel.app
```

### Step 4: Set Environment Variables on Vercel

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project: `haider-cricket-backend`
3. Go to **Settings** tab
4. Click **Environment Variables** in sidebar
5. Add three variables:

```
EMAIL_USER = wafi.syed5@gmail.com
EMAIL_PASSWORD = mgdadohzcvfhoewa
BUSINESS_EMAIL = Haider_waqas@yahoo.com
```

6. Click **Save**

### Step 5: Redeploy with Variables
```bash
vercel --prod
```

### ✅ Done!

Your backend is now live at:
```
https://haider-cricket-backend.vercel.app
```

The frontend automatically uses this URL. ✅

## Frontend Configuration

**Good news:** No changes needed!

The frontend (script.js) automatically detects:
- **Local development** → uses `http://localhost:3001`
- **GitHub Pages** → uses `https://haider-cricket-backend.vercel.app`

## How It Works

1. User fills quote form
2. Uploads logo + designs jersey
3. Clicks "Get a Quote"
4. Frontend sends to your Vercel backend
5. Backend sends formatted email with all attachments
6. Email goes to business + CC to customer

## Environment Variables

### Local (.env file)
```
EMAIL_USER=wafi.syed5@gmail.com
EMAIL_PASSWORD=mgdadohzcvfhoewa
BUSINESS_EMAIL=Haider_waqas@yahoo.com
```

### On Vercel
Set via Dashboard (Step 4 above)

**Note:** `.env` is in `.gitignore` - never pushed to GitHub ✅

## API Endpoint

### POST `/api/order`

Receives:
- Phone & email
- Jersey design screenshots (base64 PNG)
- Uploaded logos (base64 images)

Sends email with all attachments included.

## Troubleshooting

**❌ Emails not sending?**
1. Check environment variables on Vercel dashboard
2. Redeploy: `vercel --prod`
3. Check logs: `vercel logs`

**❌ Backend URL not working?**
1. Confirm Step 5 completed: `vercel --prod`
2. Check environment variables are set

**❌ "Cannot find module"?**
```bash
npm install
vercel --prod
```

## Updating Backend

After making changes:
```bash
cd backend
git add .
git commit -m "Update backend"
git push
vercel --prod
```

## Technology

- Node.js + Express
- Nodemailer (Gmail SMTP)
- Vercel Serverless Deployment

---

**Original Setup Instructions** (for reference):
