# Jersey Order Email System

This backend service receives order submissions and sends beautifully formatted emails with jersey design previews.

## How It Works

1. **Frontend** (products.html) captures both front and back jersey designs as PNG images
2. **Images** are converted to base64 and sent to Formspree along with order data
3. **Formspree webhook** posts the data to your backend server
4. **Backend** converts base64 images back to PNG files and sends a formatted email with attachments

## Setup Instructions

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env` and fill in your details:

```bash
cp .env.example .env
```

Edit `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
BUSINESS_EMAIL=business@haiderrcricket.com
PORT=3000
```

**For Gmail:**
- Enable 2-Factor Authentication
- Generate an [App Password](https://myaccount.google.com/apppasswords)
- Use the app password (16 characters) as `EMAIL_PASSWORD`

### Step 3: Test Locally

```bash
npm start
```

Server runs on `http://localhost:3000`

### Step 4: Expose to Internet (for testing)

Install ngrok:
```bash
npm install -g ngrok
```

In a new terminal:
```bash
ngrok http 3000
```

You'll get a URL like: `https://abc123.ngrok.io`

### Step 5: Configure Formspree Webhook

1. Go to your [Formspree Dashboard](https://formspree.io/dashboard)
2. Select your form
3. Go to **Settings → Integrations**
4. Add Webhook:
   - **URL**: `https://abc123.ngrok.io/api/order`
   - **Events**: Form submission

### Step 6: Update Frontend

In `products.html`, update the form action:
```html
<form class="order-form" id="orderForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

## What Gets Emailed

The email includes:

```
📋 Customer Information
   • Phone number
   • Email address

👕 Shirt Order
   • Quantity
   • Sizes

👖 Pant Order (optional)
   • Quantity
   • Sizes

👤 Player Details (optional)
   • Names
   • Numbers

🏏 Jersey Design Preview
   • Front view (PNG image)
   • Back view (PNG image)

📝 Design Customization Details
   • Design type (custom/premade)
   • Back number styling
   • Back name styling
   • Logo count
   • Color codes
   • Position/size values
```

## Email Recipients

- **To**: Your business email (BUSINESS_EMAIL in .env)
- **CC**: Customer's email (so they get a copy)

## Deployment

### Option 1: Vercel

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Option 2: Heroku

1. `heroku create your-app-name`
2. `heroku config:set EMAIL_USER=...`
3. `heroku config:set EMAIL_PASSWORD=...`
4. `heroku config:set BUSINESS_EMAIL=...`
5. `git push heroku main`

### Option 3: Railway/Render

Similar to Heroku - just set environment variables and deploy.

## Troubleshooting

**Images not showing in email?**
- Make sure html2canvas is loaded in products.html
- Check browser console for errors during capture
- Verify base64 encoding is working

**Emails not sending?**
- Check .env variables are correct
- Verify Gmail app password (if using Gmail)
- Check server logs for nodemailer errors
- Ensure less secure apps are allowed (if not using app password)

**Webhook not triggering?**
- Verify webhook URL in Formspree settings
- Check ngrok is still running
- Look at Formspree logs for failed deliveries

## Questions?

Check the console logs in your backend terminal for debugging info!
