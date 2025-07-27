const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Custom middleware for cache control
app.use((req, res, next) => {
    // Don't cache files with version parameters
    if (req.query.v) {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
    // Cache static files for a short time
    else if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
        res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    }
    next();
});

// Serve static files
app.use(express.static(__dirname, {
    index: 'index.html'
}));

// Simple health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Date Night App Server Running'
    });
});

// Catch all route - serve index.html for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Date Night App server running on port', PORT);
    console.log('📱 Open http://localhost:' + PORT + ' to use the app');
    console.log('💾 Using localStorage only (no database)');
});

module.exports = app;
