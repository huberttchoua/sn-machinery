import dotenv from 'dotenv';
import { sendEmail } from './src/utils/emailService';

dotenv.config();

/**
 * Test Email Configuration
 * 
 * This script tests if your email configuration is working correctly.
 * Run with: npx ts-node testEmail.ts
 */

async function testEmailConfiguration() {
    console.log('🧪 Testing Email Configuration...\n');

    // Check if environment variables are set
    console.log('📋 Checking environment variables:');
    console.log(`   EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || '❌ Not set'}`);
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || '❌ Not set'}`);
    console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set'}\n`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('❌ Email credentials not configured!');
        console.log('Please update your .env file with EMAIL_USER and EMAIL_PASSWORD');
        console.log('See EMAIL_SETUP.md for detailed instructions.\n');
        return;
    }

    // Send test email
    console.log('📧 Sending test email...\n');

    const testEmailAddress = process.env.EMAIL_USER; // Send to yourself for testing

    const result = await sendEmail({
        to: testEmailAddress,
        subject: 'SN Machinery - Email Configuration Test',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">✅ Email Configuration Successful!</h2>
                <p>Congratulations! Your email configuration is working correctly.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Email Service:</strong> ${process.env.EMAIL_SERVICE}</p>
                    <p><strong>Sender:</strong> ${process.env.EMAIL_USER}</p>
                    <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <p>Your SN Machinery system is now ready to send emails for:</p>
                <ul>
                    <li>User registration (welcome emails)</li>
                    <li>Rental requests (admin notifications)</li>
                    <li>Rental approvals (customer confirmations)</li>
                    <li>Rental completions (thank you emails)</li>
                    <li>Payment confirmations</li>
                </ul>
                <p style="margin-top: 30px;">Best regards,<br>SN Machinery System</p>
            </div>
        `,
        text: `
Email Configuration Successful!

Your email configuration is working correctly.

Email Service: ${process.env.EMAIL_SERVICE}
Sender: ${process.env.EMAIL_USER}
Test Time: ${new Date().toLocaleString()}

Your SN Machinery system is now ready to send emails for:
- User registration (welcome emails)
- Rental requests (admin notifications)
- Rental approvals (customer confirmations)
- Rental completions (thank you emails)
- Payment confirmations

Best regards,
SN Machinery System
        `
    });

    if (result) {
        console.log('✅ Test email sent successfully!');
        console.log(`📬 Check your inbox at: ${testEmailAddress}\n`);
        console.log('🎉 Email system is ready to use!\n');
    } else {
        console.log('❌ Failed to send test email.');
        console.log('Please check your email configuration and try again.');
        console.log('See EMAIL_SETUP.md for troubleshooting tips.\n');
    }
}

// Run the test
testEmailConfiguration()
    .then(() => {
        console.log('Test completed.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error during test:', error);
        process.exit(1);
    });
