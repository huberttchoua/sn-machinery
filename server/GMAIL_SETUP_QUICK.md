# 📧 Quick Gmail Setup Guide

## Option 1: Automated Setup (Recommended)

Run the setup script:
```bash
cd /Users/mac/Documents/SN\ Machinery/server
./setup-gmail.sh
```

The script will guide you through the entire process!

---

## Option 2: Manual Setup

### Step 1: Enable 2-Factor Authentication

1. Go to: **https://myaccount.google.com/security**
2. Find "How you sign in to Google"
3. Click **"2-Step Verification"**
4. Follow the setup instructions

### Step 2: Create App Password

1. Go to: **https://myaccount.google.com/apppasswords**
2. Sign in if prompted
3. Under "Select app", choose **"Mail"**
4. Under "Select device", choose **"Other (Custom name)"**
5. Type **"SN Machinery"**
6. Click **"Generate"**
7. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File

1. Open the `.env` file:
   ```bash
   cd /Users/mac/Documents/SN\ Machinery/server
   nano .env
   ```

2. Update these lines:
   ```bash
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-actual-email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   ```
   
   ⚠️ **IMPORTANT**: Remove all spaces from the App Password!
   - ❌ Wrong: `abcd efgh ijkl mnop`
   - ✅ Correct: `abcdefghijklmnop`

3. Save the file:
   - Press `Ctrl + X`
   - Press `Y` to confirm
   - Press `Enter` to save

### Step 4: Test Email Configuration

```bash
cd /Users/mac/Documents/SN\ Machinery/server
npx ts-node testEmail.ts
```

You should receive a test email at your Gmail address!

### Step 5: Restart the Server

The server needs to be restarted to load the new configuration:

1. Stop the current server (press `Ctrl + C` in the terminal running the server)
2. Start it again:
   ```bash
   npm run dev
   ```

---

## ✅ Verification Checklist

- [ ] 2-Factor Authentication enabled on Gmail
- [ ] App Password created
- [ ] `.env` file updated with your email and app password
- [ ] Test email sent successfully
- [ ] Server restarted

---

## 🧪 Testing the System

Once configured, test these features:

### 1. Welcome Email
- Register a new user account
- Check the email inbox for welcome email

### 2. Rental Request Email
- As a customer, submit a rental request
- Check admin email for notification

### 3. Rental Approval Email
- As an admin, approve a rental
- Check customer email for approval confirmation

---

## 🐛 Troubleshooting

### "Invalid login" Error
- ✅ Make sure you're using an **App Password**, not your regular Gmail password
- ✅ Remove all spaces from the App Password
- ✅ Enable 2-Factor Authentication first

### "Username and Password not accepted"
- ✅ Double-check your email address is correct
- ✅ Regenerate the App Password and try again

### No Email Received
- ✅ Check spam/junk folder
- ✅ Verify the email address in the database is correct
- ✅ Check server console for error messages

### Server Console Shows Warning
If you see: `"Email credentials not configured. Emails will not be sent."`
- ✅ Make sure `.env` file has correct EMAIL_USER and EMAIL_PASSWORD
- ✅ Restart the server after updating `.env`

---

## 📝 Example .env Configuration

```bash
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=snmachinery@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop

# Note: Replace with your actual Gmail and App Password
```

---

## 🔐 Security Tips

1. **Never share your App Password**
2. **Never commit `.env` to Git** (it's already in `.gitignore`)
3. **Rotate App Passwords regularly**
4. **Use a dedicated email for the application** (optional but recommended)
5. **Revoke App Passwords you're not using**

---

## 📚 Additional Resources

- **Full Setup Guide**: See `EMAIL_SETUP.md`
- **Architecture**: See `EMAIL_ARCHITECTURE.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

---

## 🆘 Need Help?

1. Check the server console for error messages
2. Run the test script: `npx ts-node testEmail.ts`
3. Review `EMAIL_SETUP.md` for detailed troubleshooting

---

**Last Updated**: February 3, 2026
