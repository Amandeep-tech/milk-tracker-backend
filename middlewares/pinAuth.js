exports.pinAuth = (req, res, next) => {
    const pin = req.headers['x-app-pin']
    if(!pin || pin !== process.env.APP_PIN) {
        res.status(401).json({ success: false, message: 'Unauthorized: Invalid or missing PIN' });
    }
    next();
    
}