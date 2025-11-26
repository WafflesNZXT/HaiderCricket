/**
 * This is a backend service to handle jersey design emails
 * Deploy this on Vercel, Heroku, or any Node.js hosting
 * 
 * For local testing, run: npm install && npm start
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure your email service
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Convert base64 string to buffer
 */
function base64ToBuffer(base64String) {
    const base64Data = base64String.replace(/^data:image\/png;base64,/, '');
    return Buffer.from(base64Data, 'base64');
}

/**
 * Send order email with design attachments
 */
async function sendOrderEmail(orderData) {
    try {
        // Parse design screenshots
        let frontImageBuffer = null;
        let backImageBuffer = null;
        
        if (orderData.designScreenshot) {
            const [frontPart, backPart] = orderData.designScreenshot.split('\n\nBACK_VIEW:\n');
            const frontBase64 = frontPart.replace('FRONT_VIEW:\n', '');
            
            if (frontBase64) {
                frontImageBuffer = base64ToBuffer(frontBase64);
            }
            
            if (backPart) {
                backImageBuffer = base64ToBuffer(backPart);
            }
        }
        
        // Prepare email HTML
        const emailHTML = generateEmailHTML(orderData);
        
        // Prepare attachments
        const attachments = [];
        if (frontImageBuffer) {
            attachments.push({
                filename: 'jersey-front.png',
                content: frontImageBuffer,
                cid: 'front-jersey'
            });
        }
        if (backImageBuffer) {
            attachments.push({
                filename: 'jersey-back.png',
                content: backImageBuffer,
                cid: 'back-jersey'
            });
        }
        
        // Send email to business
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.BUSINESS_EMAIL,
            cc: orderData.email,
            subject: `New Cricket Jersey Order - ${orderData.phone}`,
            html: emailHTML,
            attachments: attachments
        });
        
        console.log('Order email sent successfully');
        return { success: true, message: 'Order email sent' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Generate HTML email template
 */
function generateEmailHTML(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 20px auto; background: white; padding: 30px; border-radius: 10px; }
            .header { border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
            .header h2 { color: #333; margin: 0; }
            .order-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .order-details h3 { color: #667eea; margin-top: 0; }
            .order-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .order-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .design-section { margin: 30px 0; text-align: center; }
            .design-section h3 { color: #667eea; margin-bottom: 15px; }
            .design-image { max-width: 100%; height: auto; border: 2px solid #ddd; border-radius: 8px; margin: 10px 0; }
            .design-data { background: #f0f0f0; padding: 15px; border-radius: 8px; text-align: left; font-size: 12px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🏏 New Cricket Jersey Order</h2>
            </div>
            
            <div class="order-details">
                <h3>Customer Information</h3>
                <div class="order-row">
                    <span class="label">Phone:</span>
                    <span class="value">${data.phone}</span>
                </div>
                <div class="order-row">
                    <span class="label">Email:</span>
                    <span class="value">${data.email}</span>
                </div>
            </div>
            
            <div class="order-details">
                <h3>Shirt Order</h3>
                <div class="order-row">
                    <span class="label">Quantity:</span>
                    <span class="value">${data.shirtQuantity || 'N/A'}</span>
                </div>
                <div class="order-row">
                    <span class="label">Sizes:</span>
                    <span class="value">${data.shirtSizes || 'N/A'}</span>
                </div>
            </div>
            
            ${data.pantQuantity ? `
            <div class="order-details">
                <h3>Pant Order</h3>
                <div class="order-row">
                    <span class="label">Quantity:</span>
                    <span class="value">${data.pantQuantity}</span>
                </div>
                <div class="order-row">
                    <span class="label">Sizes:</span>
                    <span class="value">${data.pantSizes || 'N/A'}</span>
                </div>
            </div>
            ` : ''}
            
            ${data.playernames ? `
            <div class="order-details">
                <h3>Player Details</h3>
                <div class="order-row">
                    <span class="label">Names:</span>
                    <span class="value">${data.playernames}</span>
                </div>
                ${data.playernumbers ? `
                <div class="order-row">
                    <span class="label">Numbers:</span>
                    <span class="value">${data.playernumbers}</span>
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            <div class="design-section">
                <h3>Jersey Design Preview</h3>
                <h4>Front View</h4>
                <img src="cid:front-jersey" class="design-image" alt="Jersey Front">
                
                <h4>Back View</h4>
                <img src="cid:back-jersey" class="design-image" alt="Jersey Back">
            </div>
            
            ${data.designData ? `
            <div class="design-data">
                <h4>Design Customization Details:</h4>
                <pre>${data.designData}</pre>
            </div>
            ` : ''}
            
            <div class="footer">
                <p>Order received at Haider Cricket | Thank you for your business!</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

module.exports = { sendOrderEmail };
