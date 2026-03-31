# Login Attempt Limiter & Password Reset Implementation

## 🎉 What's New

Your SN Machinery system now has **enhanced security features** to protect user accounts:

1. **Login Attempt Limiting** - Accounts are temporarily locked after too many failed login attempts
2. **Password Reset via Email** - Users can reset their password using a secure email link
3. **Magic Login Link** - Locked users receive a one-time login link via email

---

## 📦 Changes Made

### 1. **Database Schema Updates** (`prisma/schema.prisma`)

Added new fields to the User model:

- `failedLoginAttempts` - Tracks number of failed login attempts (default: 0)
- `accountLockedUntil` - Timestamp when account will be unlocked
- `resetPasswordToken` - Secure token for password reset
- `resetPasswordExpires` - Expiration time for reset token

### 2. **Enhanced Login Controller** (`src/controllers/authController.ts`)

The login function now:

- ✅ Tracks failed login attempts
- ✅ Locks account after **5 failed attempts** for **30 minutes**
- ✅ Sends email notification when account is locked
- ✅ Sends magic login link to bypass lock
- ✅ Shows remaining attempts to user
- ✅ Automatically resets attempts on successful login
- ✅ Auto-unlocks account after lock period expires

### 3. **New Password Reset Controller** (`src/controllers/passwordReset.ts`)

Three new endpoints:

1. **Request Password Reset** - Generates and emails reset link
2. **Reset Password** - Validates token and updates password
3. **Magic Login** - One-time login via email link

### 4. **Email Templates** (`src/utils/emailService.ts`)

Added professional email templates:

- 📧 **Password Reset Email** - With secure reset link
- 📧 **Magic Login Link** - For locked accounts
- 📧 **Account Locked Notification** - Informs user of lock status

### 5. **New API Routes** (`src/routes/authRoutes.ts`)

```
POST /api/auth/request-password-reset
POST /api/auth/reset-password
POST /api/auth/magic-login
```

---

## 🔒 Security Features

### Login Attempt Limiting

**Configuration:**

- Maximum attempts: **5**
- Lock duration: **30 minutes**
- Attempts reset on successful login

**User Experience:**

```
Attempt 1-4: "Invalid credentials. You have X attempt(s) remaining..."
Attempt 5: Account locked + emails sent
After 30 min: Account auto-unlocks
```

### Account Lock Behavior

When account is locked:

1. User receives **2 emails**:
   - Account locked notification with unlock time
   - Magic login link (valid for 1 hour)
2. User can either:
   - Wait for auto-unlock (30 minutes)
   - Use magic login link
   - Reset password

### Password Reset Flow

1. User requests password reset
2. System generates secure token (valid 1 hour)
3. Email sent with reset link
4. User clicks link and sets new password
5. Account unlocked, attempts reset

---

## 🚀 API Endpoints

### 1. Request Password Reset

```http
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

### 2. Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc123...",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**

```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

### 3. Magic Login

```http
POST /api/auth/magic-login
Content-Type: application/json

{
  "token": "xyz789..."
}
```

**Response:**

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Customer"
  },
  "message": "Login successful via magic link"
}
```

### 4. Enhanced Login Response

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "wrong_password"
}
```

**Response (Failed Attempt):**

```json
{
  "error": "Invalid credentials",
  "attemptsLeft": 3,
  "message": "You have 3 attempt(s) remaining before your account is locked."
}
```

**Response (Account Locked):**

```json
{
  "error": "Account is temporarily locked due to multiple failed login attempts",
  "lockedUntil": "2/9/2026, 10:52:00 AM",
  "message": "Please check your email for a login link or wait until the unlock time."
}
```

---

## 📧 Email Examples

### Password Reset Email

**Subject:** Reset Your Password - SN Machinery

**Content:**

- Personalized greeting
- "Reset Password" button with secure link
- Expiration notice (1 hour)
- Security disclaimer

### Magic Login Link Email

**Subject:** Your Login Link - SN Machinery

**Content:**

- Account lock notification
- "Login Now" button
- Link expiration (1 hour)
- Security warning

### Account Locked Email

**Subject:** Account Temporarily Locked - SN Machinery

**Content:**

- Lock reason
- Unlock time
- Instructions for password reset

---

## 🛡️ Security Best Practices

✅ **Implemented:**

- Secure token generation using crypto.randomBytes
- Token expiration (1 hour)
- Password strength validation
- Account auto-unlock after timeout
- Failed attempt tracking
- Email-based verification

⚠️ **Recommendations:**

- Tokens are single-use (cleared after use)
- Emails don't reveal if account exists (security by obscurity)
- All sensitive operations logged
- HTTPS required in production

---

## 🧪 Testing the Feature

### Test Login Attempt Limiting

1. **Try to login with wrong password 5 times:**

   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"wrong"}'
   ```

2. **Check your email** for:
   - Account locked notification
   - Magic login link

3. **Wait 30 minutes** or use magic link to unlock

### Test Password Reset

1. **Request reset:**

   ```bash
   curl -X POST http://localhost:3001/api/auth/request-password-reset \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

2. **Check email** for reset link

3. **Reset password:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"token":"TOKEN_FROM_EMAIL","newPassword":"NewPass123!"}'
   ```

---

## 📁 Files Modified/Created

### Modified Files

- ✏️ `prisma/schema.prisma` - Added security fields to User model
- ✏️ `src/controllers/authController.ts` - Enhanced login with attempt limiting
- ✏️ `src/utils/emailService.ts` - Added password reset email templates
- ✏️ `src/routes/authRoutes.ts` - Added new password reset routes

### New Files

- ✨ `src/controllers/passwordReset.ts` - Password reset & magic login logic

---

## 🎯 Next Steps

### For Frontend Integration

You'll need to create these pages:

1. **Forgot Password Page** (`/forgot-password`)
   - Email input form
   - Calls `/api/auth/request-password-reset`

2. **Reset Password Page** (`/reset-password?token=...`)
   - New password input (with confirmation)
   - Calls `/api/auth/reset-password`
   - Password strength indicator

3. **Magic Login Page** (`/magic-login?token=...`)
   - Auto-login on page load
   - Calls `/api/auth/magic-login`
   - Redirects to dashboard

4. **Update Login Page**
   - Display `attemptsLeft` warning
   - Show "Forgot Password?" link
   - Handle account locked error

---

## 💡 Configuration

You can adjust these constants in `authController.ts`:

```typescript
const MAX_LOGIN_ATTEMPTS = 5; // Change max attempts
const LOCK_TIME_MINUTES = 30; // Change lock duration
```

Token expiration in `passwordReset.ts`:

```typescript
tokenExpires.setHours(tokenExpires.getHours() + 1); // 1 hour
```

---

## 🐛 Troubleshooting

### TypeScript Errors

The TypeScript errors you see are expected and will resolve when the server restarts. The Prisma client needs to reload with the new schema fields.

**To fix:** Restart the dev server

```bash
# Stop current server (Ctrl+C)
cd server
npm run dev
```

### Emails Not Sending

Check your `.env` file has email configured:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

**Implementation Date**: February 9, 2026  
**Version**: 2.0.0  
**Status**: ✅ Backend Complete - Frontend Integration Needed

🎉 **Your system is now more secure with login attempt limiting and password reset functionality!**
