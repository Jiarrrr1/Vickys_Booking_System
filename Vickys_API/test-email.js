require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function testEmail() {
    try {
        const info = await transporter.sendMail({
            from: `"Test" <${process.env.EMAIL_USER}>`,
            to: process.env.COMPANY_EMAIL,
            subject: 'Test Email from Node.js',
            text: 'If you receive this, email setup is working!'
        });
        
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Email failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Check if EMAIL_USER and EMAIL_PASS are correct');
        console.log('2. For Gmail: Make sure you\'re using App Password');
        console.log('3. Check if "Less secure app access" is ON (not needed for App Password)');
        console.log('4. Check firewall/antivirus blocking SMTP');
    }
}

testEmail();