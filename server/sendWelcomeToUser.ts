import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { sendEmail, emailTemplates } from './src/utils/emailService';

dotenv.config();
const prisma = new PrismaClient();

async function sendWelcomeToUser(email: string) {
    console.log(`🔍 Looking for user with email: ${email}`);

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.error(`❌ User not found with email: ${email}`);
            console.log('💡 Tip: They might need to register first, or double check the email address.');
            return;
        }

        console.log(`✅ User found: ${user.name} (${user.accountType})`);
        console.log(`📧 Sending welcome email to: ${user.email}...`);

        const welcomeEmailContent = emailTemplates.welcomeEmail(user.name, user.accountType || 'Individual');

        const result = await sendEmail({
            to: user.email,
            subject: welcomeEmailContent.subject,
            html: welcomeEmailContent.html,
            text: welcomeEmailContent.text
        });

        if (result) {
            console.log(`✅ Welcome email sent successfully to ${user.email}!`);
        } else {
            console.error(`❌ Failed to send welcome email to ${user.email}. Check logs.`);
        }

    } catch (error) {
        console.error('❌ database error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Get email from command line arg
const targetEmail = process.argv[2];

if (!targetEmail) {
    console.log('⚠️  Usage: npx ts-node sendWelcomeToUser.ts <email>');
    console.log('   Example: npx ts-node sendWelcomeToUser.ts myfullmovis@gmail.com');
} else {
    sendWelcomeToUser(targetEmail);
}
