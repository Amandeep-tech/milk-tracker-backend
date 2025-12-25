const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const milkRoutes = require('./routes/milkRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const internalRoutes = require('./routes/internalRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const ResponseDto = require('./utils/responseDto');
const { pinAuth } = require('./middlewares/pinAuth');
const {checkCors} = require('./middlewares/cors');
const {apiRateLimiter} = require('./middlewares/apiRateLimit');

// middleware to handle CORS for all routes
app.use(checkCors);

// middleware to limit API requests starting from "/api"
app.use('/api', apiRateLimiter);

// middleware to protect routes with PIN
app.use('/api', pinAuth);

app.use('/api/settings', settingsRoutes);

app.use('/api/milk', milkRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/internal', internalRoutes);




app.get('/health', (req, res) => {
    res.status(200).json(ResponseDto.success(null, 'Milk Tracker Backend Server is healthy'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});