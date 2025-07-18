const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const milkRoutes = require('./routes/milkRoutes');

app.use('/api/milk', milkRoutes);




app.get('/health', (req, res) => {
    res.json(ResponseDto.success(null, 'Milk Tracker Backend Server is running'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});