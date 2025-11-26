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
    // Remove data URI prefix if present (handles png, jpg, jpeg, gif, etc.)
    const base64Data = base64String.replace(/^data:image\/[^;]+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
}

/**
 * Extract logos from uploaded data
 */
function extractUploadedLogos(uploadedLogosJSON) {
    try {
        if (!uploadedLogosJSON) {
            console.log('No uploadedLogosJSON received');
            return [];
        }
        console.log('Parsing uploadedLogosJSON:', typeof uploadedLogosJSON, uploadedLogosJSON.length > 0 ? 'with data' : 'empty');
        const logos = JSON.parse(uploadedLogosJSON);
        console.log('Parsed logos count:', logos.length);
        return Array.isArray(logos) ? logos : [];
    } catch (e) {
        console.error('Error parsing uploaded logos:', e);
        return [];
    }
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
        
        // Extract uploaded logos
        const uploadedLogos = extractUploadedLogos(orderData.uploadedLogos);
        console.log('Extracted uploadedLogos:', uploadedLogos.length, 'logos');
        console.log('uploadedLogos details:', uploadedLogos.map((l, i) => ({
            index: i,
            name: l.name,
            hasData: !!l.data,
            dataLength: l.data ? l.data.length : 0,
            dataPrefix: l.data ? l.data.substring(0, 50) : 'NO DATA'
        })));
        
        // Prepare email HTML
        const emailHTML = generateEmailHTML(orderData, uploadedLogos.length);
        
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
        
        // Add uploaded logos as attachments
        uploadedLogos.forEach((logo, idx) => {
            try {
                console.log(`Processing logo ${idx + 1}: ${logo.name}, data length: ${logo.data ? logo.data.length : 0}`);
                const logoBuffer = base64ToBuffer(logo.data);
                console.log(`Logo ${idx + 1} converted to buffer, size: ${logoBuffer.length} bytes`);
                attachments.push({
                    filename: `uploaded-logo-${idx + 1}.png`,
                    content: logoBuffer,
                    cid: `uploaded-logo-${idx + 1}`
                });
                console.log(`Logo ${idx + 1} added to attachments with cid: uploaded-logo-${idx + 1}`);
            } catch (e) {
                console.error(`Error processing uploaded logo ${idx + 1}:`, e);
            }
        });
        
        // Send email to business
        console.log(`About to send email with ${attachments.length} attachments`);
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.BUSINESS_EMAIL,
            cc: orderData.email,
            subject: `New Cricket Jersey Quote Request - ${orderData.phone}`,
            html: emailHTML,
            attachments: attachments
        });
        
        console.log('Quote request email sent successfully');
        return { success: true, message: 'Quote request email sent' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Generate HTML email template
 */
function generateEmailHTML(data, uploadedLogosCount) {
    let uploadedLogosHTML = '';
    
    if (uploadedLogosCount && uploadedLogosCount > 0) {
        uploadedLogosHTML = `
            <div class="logos-section">
                <h3>Uploaded Club Logos</h3>
                <div class="logos-grid">
        `;
        
        for (let i = 1; i <= uploadedLogosCount; i++) {
            uploadedLogosHTML += `
                    <div style="text-align: center;">
                        <img src="cid:uploaded-logo-${i}" class="logo-image" alt="Club Logo ${i}">
                    </div>
            `;
        }
        
        uploadedLogosHTML += `
                </div>
            </div>
        `;
    }
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 20px auto; background: white; padding: 30px; border-radius: 10px; }
            .header { border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
            .header h2 { color: #333; margin: 0; }
            .quote-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .quote-details h3 { color: #667eea; margin-top: 0; }
            .order-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .order-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .design-section { margin: 30px 0; text-align: center; }
            .design-section h3 { color: #667eea; margin-bottom: 15px; }
            .design-section h4 { color: #555; margin: 15px 0 10px 0; }
            .design-image { max-width: 100%; height: auto; border: 2px solid #ddd; border-radius: 8px; margin: 10px 0; }
            .logos-section { margin: 30px 0; }
            .logos-section h3 { color: #667eea; margin-top: 0; margin-bottom: 15px; }
            .logos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
            .logo-image { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; padding: 8px; }
            .thank-you { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .thank-you p { color: #1565c0; margin: 0; line-height: 1.6; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🏏 Cricket Jersey Quote Request</h2>
            </div>
            
            <div class="quote-details">
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
            
            <div class="design-section">
                <h3>Jersey Design Preview</h3>
                <h4>Front View</h4>
                <img src="cid:front-jersey" class="design-image" alt="Jersey Front">
                
                <h4>Back View</h4>
                <img src="cid:back-jersey" class="design-image" alt="Jersey Back">
            </div>
            
            ${uploadedLogosHTML}
            
            <div class="thank-you">
                <p><strong>Thank You!</strong></p>
                <p>We have received your quote request. Someone from our team will reach you within <strong>1-2 business days</strong> with a customized quote and to discuss your cricket jersey requirements.</p>
                <p>We look forward to working with you!</p>
            </div>
            
            <div class="footer">
                <p>Haider Cricket | Forged for the Brave | Thank you for choosing us!</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

module.exports = { sendOrderEmail };
