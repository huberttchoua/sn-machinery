# Email System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SN Machinery Email System                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │────────▶│   Backend    │────────▶│ Email Server │
│  (React App) │         │  (Express)   │         │  (Gmail/etc) │
└──────────────┘         └──────────────┘         └──────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   Database   │
                         │  (SQLite)    │
                         └──────────────┘
```

## Email Flow Diagram

### 1. User Registration Flow
```
User Fills Form ──▶ POST /api/auth/register ──▶ Create User in DB
                                                       │
                                                       ▼
                                              Generate JWT Token
                                                       │
                                                       ▼
                                           Send Welcome Email 📧
                                                       │
                                                       ▼
                                              Return User + Token
```

### 2. Rental Request Flow
```
Customer Submits ──▶ POST /api/rentals ──▶ Create Rental in DB
Rental Request                                     │
                                                   ├──▶ In-App Notification (Customer)
                                                   │
                                                   ├──▶ In-App Notification (Admins)
                                                   │
                                                   └──▶ Email to All Admins 📧
```

### 3. Rental Approval Flow
```
Admin Approves ──▶ PUT /api/rentals/:id ──▶ Update Rental Status
Rental                                              │
                                                    ├──▶ Update Machine Status
                                                    │
                                                    ├──▶ In-App Notification (Customer)
                                                    │
                                                    └──▶ Approval Email to Customer 📧
```

### 4. Rental Completion Flow
```
Admin Completes ──▶ PUT /api/rentals/:id ──▶ Update Rental Status
Rental                                              │
                                                    ├──▶ Create Finance Record
                                                    │
                                                    ├──▶ Update Machine Status
                                                    │
                                                    ├──▶ In-App Notification (Customer)
                                                    │
                                                    └──▶ Completion Email to Customer 📧
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Email Service Layer                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           emailService.ts (Core Service)             │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  • createTransporter()                               │  │
│  │  • sendEmail(options)                                │  │
│  │  • emailTemplates{}                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Nodemailer Library                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             ▼
                    ┌─────────────────┐
                    │  Email Provider │
                    │  (Gmail, etc)   │
                    └─────────────────┘
```

## Controller Integration

```
┌─────────────────────────────────────────────────────────────┐
│                    Controller Layer                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ authController   │  │ rental.controller│                │
│  ├──────────────────┤  ├──────────────────┤                │
│  │ • register()     │  │ • createRental() │                │
│  │   └─▶ Welcome    │  │   └─▶ Request    │                │
│  │       Email      │  │       Email      │                │
│  └──────────────────┘  │ • updateStatus() │                │
│                        │   └─▶ Approval   │                │
│                        │       Completion │                │
│                        │       Rejection  │                │
│                        └──────────────────┘                │
│                                │                             │
│                                ▼                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      notification.controller.ts                      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  • createNotification(message, type, userId,         │  │
│  │                       isAdmin, emailOptions)         │  │
│  │  • sendAdminEmail(subject, html, text)               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                │                             │
└────────────────────────────────┼─────────────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │   emailService.ts       │
                    │   • sendEmail()         │
                    │   • emailTemplates{}    │
                    └─────────────────────────┘
```

## Email Templates Structure

```
emailTemplates
├── welcomeEmail(userName, accountType)
│   ├── subject: "Welcome to SN Machinery"
│   ├── html: <Professional HTML>
│   └── text: <Plain text version>
│
├── rentalRequest(userName, machineName, startDate, endDate)
│   ├── subject: "New Rental Request"
│   ├── html: <Admin notification HTML>
│   └── text: <Plain text version>
│
├── rentalApproved(userName, machineName, startDate, endDate)
│   ├── subject: "Rental Request Approved"
│   ├── html: <Approval confirmation HTML>
│   └── text: <Plain text version>
│
├── rentalRejected(userName, machineName, reason)
│   ├── subject: "Rental Request Update"
│   ├── html: <Rejection notice HTML>
│   └── text: <Plain text version>
│
├── rentalCompleted(userName, machineName, totalCost)
│   ├── subject: "Rental Completed"
│   ├── html: <Thank you HTML>
│   └── text: <Plain text version>
│
└── paymentReceived(userName, amount, rentalId)
    ├── subject: "Payment Received"
    ├── html: <Receipt confirmation HTML>
    └── text: <Plain text version>
```

## Data Flow

```
┌─────────────┐
│   Event     │ (User registers, Rental created, etc.)
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Controller calls createNotification()  │
│  with email options                     │
└──────┬──────────────────────────────────┘
       │
       ├──▶ Create in-app notification in DB
       │
       └──▶ If emailOptions provided:
            │
            ├──▶ Lookup user email from DB
            │
            ├──▶ Call sendEmail() with:
            │    • to: user.email
            │    • subject: from emailOptions
            │    • html: from emailOptions
            │    • text: from emailOptions
            │
            └──▶ Nodemailer sends email
                 │
                 ├──▶ Success: Log "Email sent"
                 │
                 └──▶ Failure: Log error, continue
```

## Environment Configuration

```
.env File
├── DATABASE_URL="file:./dev.db"
├── JWT_SECRET="your-secret-key"
├── EMAIL_SERVICE="gmail"
├── EMAIL_USER="your-email@gmail.com"
└── EMAIL_PASSWORD="your-app-password"
         │
         ▼
    Used by emailService.ts
         │
         ▼
    Creates Nodemailer transporter
         │
         ▼
    Sends emails via configured service
```

## Error Handling

```
Email Sending Attempt
         │
         ├──▶ Credentials configured?
         │    ├── No ──▶ Log warning, return false
         │    └── Yes ──▶ Continue
         │
         ├──▶ Create transporter
         │    └── Success ──▶ Continue
         │
         ├──▶ Send email
         │    ├── Success ──▶ Log success, return true
         │    └── Failure ──▶ Log error, return false
         │
         └──▶ Application continues normally
              (In-app notification still works)
```

## Security Layers

```
┌─────────────────────────────────────────┐
│  Environment Variables (.env)           │
│  • Not committed to Git                 │
│  • Contains sensitive credentials       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  App Passwords (Gmail)                  │
│  • Not regular password                 │
│  • Can be revoked independently         │
│  • Limited to email access only         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  TLS/SSL Encryption                     │
│  • Emails sent over secure connection  │
│  • Credentials encrypted in transit     │
└─────────────────────────────────────────┘
```

---

**Last Updated**: February 3, 2026  
**Version**: 1.0.0
