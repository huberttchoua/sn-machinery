import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration interface
interface EmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
}

// Create reusable transporter
const createTransporter = () => {
    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPassword) {
        console.warn('Email credentials not configured. Emails will not be sent.');
        return null;
    }

    return nodemailer.createTransport({
        service: emailService,
        auth: {
            user: emailUser,
            pass: emailPassword
        }
    });
};

// Send email function
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
    try {
        const transporter = createTransporter();

        if (!transporter) {
            console.log('Email not sent - transporter not configured');
            return false;
        }

        const mailOptions = {
            from: `"SN Machinery" <${process.env.EMAIL_USER}>`,
            to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// Email templates
export const emailTemplates = {
    rentalRequest: (userName: string, machineName: string, startDate: string, endDate: string) => ({
        subject: 'New Rental Request - SN Machinery',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">New Rental Request</h2>
                <p>Hello Admin,</p>
                <p>A new rental request has been submitted:</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Customer:</strong> ${userName}</p>
                    <p><strong>Machine:</strong> ${machineName}</p>
                    <p><strong>Start Date:</strong> ${startDate}</p>
                    <p><strong>End Date:</strong> ${endDate}</p>
                </div>
                <p>Please review and approve this request in the admin dashboard.</p>
                <p style="margin-top: 30px;">Best regards,<br>SN Machinery System</p>
            </div>
        `,
        text: `New Rental Request\n\nCustomer: ${userName}\nMachine: ${machineName}\nStart Date: ${startDate}\nEnd Date: ${endDate}\n\nPlease review and approve this request in the admin dashboard.`
    }),

    rentalApproved: (userName: string, machineName: string, startDate: string, endDate: string) => ({
        subject: 'Rental Request Approved - SN Machinery',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #10b981;">Rental Request Approved!</h2>
                <p>Hello ${userName},</p>
                <p>Great news! Your rental request has been approved.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Machine:</strong> ${machineName}</p>
                    <p><strong>Start Date:</strong> ${startDate}</p>
                    <p><strong>End Date:</strong> ${endDate}</p>
                </div>
                <p>Please make sure to pick up the machine on the scheduled date.</p>
                <p style="margin-top: 30px;">Best regards,<br>SN Machinery Team</p>
            </div>
        `,
        text: `Rental Request Approved!\n\nHello ${userName},\n\nYour rental request has been approved.\n\nMachine: ${machineName}\nStart Date: ${startDate}\nEnd Date: ${endDate}\n\nPlease make sure to pick up the machine on the scheduled date.`
    }),

    rentalRejected: (userName: string, machineName: string, reason?: string) => ({
        subject: 'Rental Request Update - SN Machinery',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ef4444;">Rental Request Update</h2>
                <p>Hello ${userName},</p>
                <p>We regret to inform you that your rental request for <strong>${machineName}</strong> could not be approved at this time.</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                <p>Please feel free to contact us or submit a new request for different dates.</p>
                <p style="margin-top: 30px;">Best regards,<br>SN Machinery Team</p>
            </div>
        `,
        text: `Rental Request Update\n\nHello ${userName},\n\nYour rental request for ${machineName} could not be approved at this time.\n${reason ? `\nReason: ${reason}` : ''}\n\nPlease feel free to contact us or submit a new request.`
    }),

    rentalCompleted: (userName: string, machineName: string, totalCost: number) => ({
        subject: 'Rental Completed - SN Machinery',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Rental Completed</h2>
                <p>Hello ${userName},</p>
                <p>Thank you for renting from SN Machinery!</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Machine:</strong> ${machineName}</p>
                    <p><strong>Total Cost:</strong> RWF ${totalCost.toLocaleString()}</p>
                </div>
                <p>We hope the equipment served you well. We look forward to serving you again!</p>
                <p style="margin-top: 30px;">Best regards,<br>SN Machinery Team</p>
            </div>
        `,
        text: `Rental Completed\n\nHello ${userName},\n\nThank you for renting from SN Machinery!\n\nMachine: ${machineName}\nTotal Cost: RWF ${totalCost.toLocaleString()}\n\nWe hope the equipment served you well.`
    }),

    paymentReceived: (userName: string, amount: number, rentalId: number) => ({
        subject: 'Payment Received - SN Machinery',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #10b981;">Payment Received</h2>
                <p>Hello ${userName},</p>
                <p>We have received your payment. Thank you!</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Amount:</strong> RWF ${amount.toLocaleString()}</p>
                    <p><strong>Rental ID:</strong> #${rentalId}</p>
                </div>
                <p>A receipt has been generated for your records.</p>
                <p style="margin-top: 30px;">Best regards,<br>SN Machinery Team</p>
            </div>
        `,
        text: `Payment Received\n\nHello ${userName},\n\nWe have received your payment of RWF ${amount.toLocaleString()} for Rental #${rentalId}.\n\nThank you!`
    }),

    welcomeEmail: (userName: string, accountType: string) => ({
        subject: '🎉 Welcome to the SN Machinery Family!',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                <!-- Header -->
                <div style="background-color: #2563eb; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to SN Machinery</h1>
                </div>

                <!-- Content -->
                <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background-color: #ffffff;">
                    <h2 style="color: #1f2937; margin-top: 0;">Hello ${userName},</h2>
                    
                    <p>We are thrilled to have you on board! Your <strong>${accountType}</strong> account has been successfully created.</p>
                    
                    <p>At SN Machinery, we are committed to providing top-tier construction equipment to help you build your dreams. Here is what you can do next:</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                            <li style="margin-bottom: 10px;">🚜 <strong>Explore our Catalog:</strong> Browse high-quality excavators, bulldozers, and cranes.</li>
                            <li style="margin-bottom: 10px;">📅 <strong>Book Rentals:</strong> Schedule machinery for your upcoming projects easily.</li>
                            <li style="margin-bottom: 10px;">📊 <strong>Track Requests:</strong> Monitor the status of your rentals in real-time.</li>
                            <li style="margin-bottom: 0;">💳 <strong>Secure Payments:</strong> Manage your transactions safely and efficiently.</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/login" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to Your Account</a>
                    </div>

                    <p style="font-size: 14px; color: #6b7280;">If you have any questions or need assistance, simply reply to this email or contact our support team.</p>
                    
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="text-align: center; font-size: 12px; color: #9ca3af; margin: 0;">
                        &copy; ${new Date().getFullYear()} SN Machinery. All rights reserved.<br>
                        Building the future, together.
                    </p>
                </div>
            </div>
        `,
        text: `Welcome to SN Machinery!

Hello ${userName},

We are thrilled to have you on board! Your ${accountType} account has been successfully created.

At SN Machinery, we are committed to providing top-tier construction equipment to help you build your dreams.

Here is what you can do next:
- Explore cur Catalog of high-quality machinery
- Book Rentals for your projects
- Track Requests in real-time
- Secure Payments

Login to your account here: http://localhost:5173/login

Best regards,
SN Machinery Team`
    }),
    verificationEmail: (userName: string, code: string) => ({
        subject: 'Verify Your Email - SN Machinery',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Verify Your Email</h2>
                <p>Hello ${userName},</p>
                <p>Thank you for registering with SN Machinery. To complete your registration, please use the verification code below:</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <h1 style="color: #1f2937; letter-spacing: 5px; margin: 0;">${code}</h1>
                </div>
                <p>If you didn't request this code, please ignore this email.</p>
                <p style="margin-top: 30px;">Best regards,<br>SN Machinery Team</p>
            </div>
        `,
        text: `Verify Your Email\n\nHello ${userName},\n\nThank you for registering with SN Machinery. To complete your registration, please use the following verification code:\n\n${code}\n\nIf you didn't request this code, please ignore this email.`
    }),

    passwordReset: (userName: string, resetLink: string) => ({
        subject: 'Reset Your Password - SN Machinery',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Reset Your Password</h2>
                <p>Hello ${userName},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour.</p>
                <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
                <p style="margin-top: 30px;">Best regards,<br>SN Machinery Team</p>
            </div>
        `,
        text: `Reset Your Password\n\nHello ${userName},\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`
    }),

    magicLoginLink: (userName: string, loginLink: string) => ({
        subject: 'Your Login Link - SN Machinery',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Login to Your Account</h2>
                <p>Hello ${userName},</p>
                <p>Your account has been temporarily locked due to multiple failed login attempts. Click the button below to securely login:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginLink}" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login Now</a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour.</p>
                <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please contact our support team immediately.</p>
                <p style="margin-top: 30px;">Best regards,<br>SN Machinery Team</p>
            </div>
        `,
        text: `Login to Your Account\n\nHello ${userName},\n\nYour account has been temporarily locked due to multiple failed login attempts. Click the link below to securely login:\n\n${loginLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please contact our support team.`
    }),

    accountLocked: (userName: string, unlockTime: string) => ({
        subject: 'Account Temporarily Locked - SN Machinery',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ef4444;">Account Temporarily Locked</h2>
                <p>Hello ${userName},</p>
                <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
                <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; border-left: 4px solid #ef4444; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Unlock Time:</strong> ${unlockTime}</p>
                </div>
                <p>For security reasons, please wait until the unlock time or use the "Forgot Password" option to reset your password.</p>
                <p style="margin-top: 30px;">Best regards,<br>SN Machinery Team</p>
            </div>
        `,
        text: `Account Temporarily Locked\n\nHello ${userName},\n\nYour account has been temporarily locked due to multiple failed login attempts.\n\nUnlock Time: ${unlockTime}\n\nFor security reasons, please wait until the unlock time or use the "Forgot Password" option.`
    })
};
