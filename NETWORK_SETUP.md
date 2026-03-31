# Network Hosting Setup Guide

This guide explains how to host the SN Machinery system so it's accessible from other laptops on your network.

## Prerequisites
- Node.js and npm installed on the host machine
- All dependencies installed in both `server` and `client` directories
- The server and client are properly configured

## How to Find Your Machine's IP Address

### On Mac:
```bash
# Get your local IP address
ipconfig getifaddr en0  # For WiFi
# or
ipconfig getifaddr en1  # Alternative WiFi interface
```

### On Windows (Command Prompt):
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

### On Linux:
```bash
hostname -I
# or
ip addr show
```

## Starting the System

### 1. Start the Backend Server

In the `server` directory:

```bash
# Install dependencies if you haven't already
npm install

# Start the server (listens on 0.0.0.0:3001)
npm run dev
```

The server will output something like:
```
Server is running on http://0.0.0.0:3001
Accessible from other devices on your network
```

### 2. Configure and Start the Frontend Client

In the `client` directory:

#### Option A: Using Localhost (Default)
```bash
# Install dependencies if you haven't already
npm install

# Start the dev server (listens on 0.0.0.0:5173)
npm run dev
```

Access at: `http://localhost:5173`

#### Option B: Configure for Network Access
Edit `client/.env.local` and set your machine's IP address:

```env
VITE_API_URL=http://YOUR_MACHINE_IP:3001
```

For example:
```env
VITE_API_URL=http://192.168.1.100:3001
```

Then start the client:
```bash
npm run dev
```

## Accessing from Other Laptops

### Find Your Host Machine's IP
Get your machine's IP address using the steps above (e.g., `192.168.1.100`)

### Access from Another Laptop

#### On the Same Network:
Open a browser on the other laptop and go to:
```
http://192.168.1.100:5173
```

**Note:** Replace `192.168.1.100` with your actual machine's IP address.

## Troubleshooting

### Can't Connect from Other Laptop?

1. **Firewall Issues**: Make sure your firewall allows connections on ports 3001 and 5173
   - Mac: System Preferences → Security & Privacy → Firewall
   - Windows: Windows Defender Firewall → Allow an app through firewall

2. **Verify Server is Running**: 
   ```bash
   curl http://YOUR_IP:3001/api/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

3. **Check Network Connectivity**:
   ```bash
   ping YOUR_IP
   ```

4. **API Connection Issues**: Ensure `VITE_API_URL` in `.env.local` is correctly set to your machine's IP

### Ports Already in Use?

If port 3001 or 5173 is already in use:

**For Server** (change in `server/src/index.ts`):
```bash
PORT=3002 npm run dev
```

**For Client** (Vite will automatically find the next available port):
```bash
npm run dev -- --port 3000
```

Then update `.env.local`:
```env
VITE_API_URL=http://YOUR_IP:3002
```

## Production Deployment

For production deployment on the internet:

1. **Use a domain name** instead of IP address
2. **Enable HTTPS/SSL** (use Let's Encrypt for free certificates)
3. **Update CORS settings** in `server/src/index.ts`
4. **Use environment variables** for sensitive configuration
5. **Deploy to a hosting service** (AWS, DigitalOcean, Heroku, etc.)

## Environment Variables

### Server (.env or .env.local)
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://YOUR_IP:5173
# Database, email, and other configs...
```

### Client (.env.local)
```env
VITE_API_URL=http://YOUR_IP:3001
```

## Quick Reference

| Component | URL | Port | Config File |
|-----------|-----|------|-------------|
| Frontend | http://YOUR_IP:5173 | 5173 | client/.env.local |
| Backend API | http://YOUR_IP:3001 | 3001 | server/.env (if used) |
| Health Check | http://YOUR_IP:3001/api/health | 3001 | - |

## Next Steps

- Configure database connection for remote access if needed
- Set up email service for production use
- Implement proper authentication and security measures
- Consider using a reverse proxy (nginx) for production
