import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

console.log("MONGODB_URI =", process.env.MONGODB_URI);

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';

import connectDB from './config/connectdb.js';

import userRouter from './route/user.route.js';
import categoryRouter from './route/category.route.js';
import uploadRouter from './route/upload.router.js';
import subCategoryRouter from './route/subCategory.route.js';
import productRouter from './route/product.route.js';
import cartRouter from './route/cart.route.js';
import addressRouter from './route/address.route.js';
import orderRouter from './route/order.route.js';

const app = express();

/* ---------------- SERVER PORT ---------------- */
const PORT = process.env.PORT || 8000;

/* ---------------- MIDDLEWARE ---------------- */
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
// Allow frontend dev origins. Use env FRONTEND_URL to override or
// permit both common Vite ports used during development.
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests (e.g., curl, Postman) when origin is undefined
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS policy: Origin not allowed'));
    },
    credentials: true
}));

/* ---------------- ROUTES ---------------- */
app.get('/', (req, res) => {
    res.json({ message: `Server is running on port ${PORT}` });
});

app.use('/api/user', userRouter);
app.use('/api/category', categoryRouter);
app.use('/api/file', uploadRouter);
app.use('/api/subcategory', subCategoryRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

/* ---------------- CONNECT DATABASE & START SERVER ---------------- */
// Attempt to connect to the database but do not prevent the server
// from starting in a degraded mode. This helps frontend development
// when the DB is temporarily unreachable (e.g., network, Atlas IP).
(async () => {
    try {
        await connectDB();
        console.log('Database connected.');
    } catch (err) {
        console.error('Warning: DB connection failed — starting server in degraded mode.');
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})();
