# Email System Setup Guide

## Overview

The SN Machinery system now supports sending real-world emails for important events such as:
- **User Registration**: Welcome emails when new users sign up
- **Rental Requests**: Notifications to admins when customers submit rental requests
- **Rental Approval**: Confirmation emails when rentals are approved
- **Rental Completion**: Thank you emails when rentals are completed
- **Rental Cancellation**: Notification emails when rentals are cancelled

## Email Configuration

### Step 1: Update Environment Variables

Edit the `.env` file in the server directory and configure the following variables:

```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Step 2: Gmail Setup (Recommended)

If you're using Gmail, you need to create an **App Password** (not your regular Gmail password):

1. **Enable 2-Factor Authentication** on your Google Account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create an App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "SN Machinery"
   - Copy the 16-character password
   - Paste it in your `.env` file as `EMAIL_PASSWORD`

3. **Update your `.env` file**:
   ```bash
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-actual-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # The 16-char app password
   ```

### Step 3: Alternative Email Providers

You can also use other email services:

#### Outlook/Hotmail
```bash
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

#### Yahoo
```bash
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-password
```

#### Custom SMTP Server
For custom email providers, you'll need to modify `src/utils/emailService.ts` to use SMTP settings:

```typescript
return nodemailer.createTransport({
    host: 'smtp.your-provider.com',
    port: 587,
    secure: false,
    auth: {
        user: emailUser,
        pass: emailPassword
    }
});
```

## Email Templates

The system includes pre-built email templates for various events:

### 1. Welcome Email
Sent when a new user registers.

### 2. Rental Request Email
Sent to admins when a customer submits a rental request.

### 3. Rental Approved Email
Sent to customers when their rental is approved.

### 4. Rental Rejected Email
Sent to customers when their rental is cancelled/rejected.

### 5. Rental Completed Email
Sent to customers when their rental is completed.

### 6. Payment Received Email
Sent to customers when payment is received.

## Testing Email Functionality

### Test 1: Registration Email
1. Register a new user account
2. Check the email inbox for a welcome email

### Test 2: Rental Request Email
1. As a customer, submit a rental request
2. Check admin email inbox for notification

### Test 3: Rental Approval Email
1. As an admin, approve a rental request
2. Check customer email inbox for approval notification

## Troubleshooting

### Emails Not Sending

**Check Console Logs**
- Look for "Email sent successfully" or error messages in the server console

**Common Issues:**

1. **Invalid Credentials**
   - Error: "Invalid login"
   - Solution: Double-check your email and app password

2. **Less Secure Apps**
   - Error: "Username and Password not accepted"
   - Solution: Use App Passwords instead of regular passwords

3. **2FA Not Enabled**
   - Error: "Application-specific password required"
   - Solution: Enable 2-Factor Authentication on your Google Account

4. **Network Issues**
   - Error: "Connection timeout"
   - Solution: Check your internet connection and firewall settings

### Email Configuration Not Set

If email credentials are not configured, the system will:
- Log a warning: "Email credentials not configured. Emails will not be sent."
- Continue to work normally with in-app notifications only
- Not throw errors

## Email Service Architecture

### Files Structure

```
server/src/
├── utils/
│   └── emailService.ts          # Email service and templates
├── controllers/
│   ├── authController.ts        # Sends welcome emails
│   ├── rental.controller.ts     # Sends rental-related emails
│   └── notification.controller.ts # Enhanced with email support
```

### How It Works

1. **Email Service** (`emailService.ts`)
   - Creates a Nodemailer transporter
   - Provides `sendEmail()` function
   - Contains pre-built email templates

2. **Notification Controller** (`notification.controller.ts`)
   - Enhanced `createNotification()` function
   - Sends both in-app notifications AND emails
   - `sendAdminEmail()` function for admin notifications

3. **Controllers**
   - Call `createNotification()` with email options
   - Emails are sent automatically when events occur

## Customizing Email Templates

To customize email templates, edit `src/utils/emailService.ts`:

```typescript
export const emailTemplates = {
    rentalApproved: (userName, machineName, startDate, endDate) => ({
        subject: 'Your Custom Subject',
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Custom HTML Content</h2>
                <p>Hello ${userName},</p>
                <!-- Your custom HTML -->
            </div>
        `,
        text: `Plain text version for email clients that don't support HTML`
    })
};
```

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use App Passwords** instead of regular passwords
3. **Rotate passwords** regularly
4. **Limit email rate** to avoid being flagged as spam
5. **Use environment variables** for all sensitive data

## Production Deployment

For production environments:

1. **Use a dedicated email service**
   - Consider: SendGrid, AWS SES, Mailgun, or Postmark
   - These provide better deliverability and analytics

2. **Set up SPF and DKIM records**
   - Improves email deliverability
   - Reduces spam classification

3. **Monitor email sending**
   - Track delivery rates
   - Monitor bounce rates
   - Handle unsubscribe requests

4. **Use email queues**
   - For high-volume applications
   - Prevents blocking the main application

## Support

For issues or questions:
- Check the server console for error messages
- Review the `.env` configuration
- Ensure 2FA and App Passwords are set up correctly
- Test with a simple email first before complex scenarios

---

**Last Updated**: February 2026
**Version**: 1.0.0
