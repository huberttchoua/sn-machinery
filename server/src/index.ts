import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import machineRoutes from './routes/machine.routes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import rentalRoutes from './routes/rental.routes';
import staffRoutes from './routes/staff.routes';
import notificationRoutes from './routes/notification.routes';
import financeRoutes from './routes/finance.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS to allow credentials from allowed front-end origins.
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://172.16.0.152:5173',  // Network IP address
    'http://172.16.0.152:5174',  // Network IP address (alternative port)
    'http://172.16.0.173:5173',
    'http://172.16.0.173:5174',
];

const localNetworkDevOriginPattern = /^http:\/\/172\.16\.\d{1,3}\.\d{1,3}:(5173|5174)$/;

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (e.g., curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || localNetworkDevOriginPattern.test(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/machines', machineRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/finances', financeRoutes);



app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// In production, serve the built React frontend from this Express server
if (process.env.NODE_ENV === 'production') {
    const clientDist = path.join(__dirname, '../../client/dist');
    app.use(express.static(clientDist));
    // SPA fallback: return index.html for any non-API route
    app.get('/{*splat}', (_req, res) => {
        res.sendFile(path.join(clientDist, 'index.html'));
    });
}

const port = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
    console.log(`Accessible from other devices on your network`);
});
