#!/bin/bash

# Gmail Setup Script for SN Machinery
# This script will guide you through setting up Gmail for your application

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Gmail Setup for SN Machinery Email System                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "📧 This script will help you configure Gmail to send emails from your app."
echo ""
echo "⚠️  IMPORTANT: You need a Gmail account with 2-Factor Authentication enabled."
echo ""

# Step 1: Check if user has Gmail account
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Gmail Account"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Do you have a Gmail account? (yes/no): " has_gmail

if [ "$has_gmail" != "yes" ]; then
    echo ""
    echo "❌ You need a Gmail account to continue."
    echo "   Please create one at: https://accounts.google.com/signup"
    exit 1
fi

echo ""
read -p "Enter your Gmail address: " gmail_address

# Step 2: Enable 2FA
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Enable 2-Factor Authentication (2FA)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You need to enable 2-Factor Authentication on your Google Account."
echo ""
echo "📱 Follow these steps:"
echo "   1. Open: https://myaccount.google.com/security"
echo "   2. Scroll to 'How you sign in to Google'"
echo "   3. Click on '2-Step Verification'"
echo "   4. Follow the setup process"
echo ""
read -p "Have you enabled 2FA? (yes/no): " has_2fa

if [ "$has_2fa" != "yes" ]; then
    echo ""
    echo "⚠️  Please enable 2FA first, then run this script again."
    echo "   Visit: https://myaccount.google.com/security"
    exit 1
fi

# Step 3: Create App Password
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Create App Password"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Now you need to create an App Password for this application."
echo ""
echo "🔑 Follow these steps:"
echo "   1. Open: https://myaccount.google.com/apppasswords"
echo "   2. You may need to sign in again"
echo "   3. In 'Select app', choose 'Mail'"
echo "   4. In 'Select device', choose 'Other (Custom name)'"
echo "   5. Type 'SN Machinery' as the name"
echo "   6. Click 'Generate'"
echo "   7. Copy the 16-character password (it looks like: abcd efgh ijkl mnop)"
echo ""
echo "⚠️  IMPORTANT: Remove all spaces from the password when you paste it!"
echo "   Example: 'abcd efgh ijkl mnop' becomes 'abcdefghijklmnop'"
echo ""
read -p "Have you created the App Password? (yes/no): " has_app_password

if [ "$has_app_password" != "yes" ]; then
    echo ""
    echo "⚠️  Please create an App Password first, then run this script again."
    echo "   Visit: https://myaccount.google.com/apppasswords"
    exit 1
fi

echo ""
read -sp "Paste your App Password (without spaces): " app_password
echo ""

# Step 4: Update .env file
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Updating Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Backup existing .env
cp .env .env.backup
echo "✅ Created backup: .env.backup"

# Update .env file
sed -i.tmp "s/EMAIL_USER=.*/EMAIL_USER=$gmail_address/" .env
sed -i.tmp "s/EMAIL_PASSWORD=.*/EMAIL_PASSWORD=$app_password/" .env
rm .env.tmp 2>/dev/null

echo "✅ Updated .env file with your credentials"
echo ""

# Step 5: Test configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Testing Email Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Would you like to send a test email now? (yes/no): " send_test

if [ "$send_test" = "yes" ]; then
    echo ""
    echo "📧 Sending test email..."
    npx ts-node testEmail.ts
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete! 🎉                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Your Gmail is now configured!"
echo "✅ The system will send emails for:"
echo "   • User registration (welcome emails)"
echo "   • Rental requests (to admins)"
echo "   • Rental approvals (to customers)"
echo "   • Rental completions (to customers)"
echo ""
echo "📝 Your configuration:"
echo "   Email: $gmail_address"
echo "   Service: Gmail"
echo ""
echo "🔄 Restart your server to apply changes:"
echo "   cd /Users/mac/Documents/SN\ Machinery/server"
echo "   npm run dev"
echo ""
echo "📚 For more information, see EMAIL_SETUP.md"
echo ""
