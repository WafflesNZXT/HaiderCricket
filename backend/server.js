/**
 * Express server to receive Formspree submissions and send formatted emails
 * 
 * Setup:
 * 1. npm install express dotenv nodemailer cors
 * 2. Create .env file with EMAIL_USER, EMAIL_PASSWORD, BUSINESS_EMAIL
 * 3. npm start
 * 4. Use ngrok (npm install -g ngrok) to expose locally: ngrok http 3000
 * 5. Add webhook URL to Formspree: https://yourngrok.ngrok.io/api/order
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sendOrderEmail } = require('./send-email');

const app = express();

// Increase JSON payload limit to handle large base64 images (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

const PORT = process.env.PORT || 3000;

/**
 * Webhook endpoint to receive Formspree submissions
 */
app.post('/api/order', async (req, res) => {
    try {
        const orderData = req.body;
        
        console.log('Received order:', {
            phone: orderData.phone,
            email: orderData.email,
            hasDesignScreenshot: !!orderData.designScreenshot,
            hasUploadedLogos: !!orderData.uploadedLogos,
            uploadedLogosLength: orderData.uploadedLogos ? orderData.uploadedLogos.length : 0
        });
        
        // Send formatted email with design attachments
        const result = await sendOrderEmail(orderData);
        
        if (result.success) {
            res.json({ success: true, message: 'Order processed and email sent' });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`\n🏏 Order processing server running on http://localhost:${PORT}`);
    console.log('📧 Webhook endpoint: http://localhost:${PORT}/api/order\n');
});
