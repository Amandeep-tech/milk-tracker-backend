const cors = require('cors');
const allowedOrigins = ['http://localhost:3000', 'https://milk-tracker-frontend.vercel.app'];

exports.checkCors = cors({
  origin: (origin, callback) => {
    // ✅ Allow server-to-server requests (no Origin header)
    if (!origin) {
      return callback(null, true);
    }

    // ✅ Allow known frontend origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ❌ Block everything else
    return callback(
      new Error(`CORS blocked for origin: ${origin}`),
      false
    );
  },
  credentials: true // Allow cookies and credentials
});