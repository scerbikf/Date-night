const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Database imports
const dbConfig = require('./database/config');
const EveningSelectionService = require('./database/evening-selection-service');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'evening-selections.json');

// Initialize database service
let eveningService;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
async function initializeDatabase() {
    try {
        await dbConfig.initialize();
        eveningService = new EveningSelectionService();
        await eveningService.initialize();
        console.log('✅ Database services initialized');
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        console.log('📁 Falling back to file storage...');
    }
}

// Custom middleware for cache control
app.use((req, res, next) => {
    // Don't cache API endpoints
    if (req.path.startsWith('/api/')) {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
    // Don't cache files with version parameters
    else if (req.query.v) {
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

app.use(express.static('public'));
app.use(express.static('.', { 
    setHeaders: (res, path) => {
        if (path.endsWith('.js') || path.endsWith('.css')) {
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
    }
}));

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Save evening selection
// API Routes

// Create new evening selection session
app.post('/api/evening-selection/start', async (req, res) => {
    try {
        const sessionId = eveningService ? eveningService.generateSessionId() : `session_${Date.now()}`;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        if (eveningService) {
            const result = await eveningService.createEveningSelection(sessionId, ipAddress, userAgent);
            res.json({ success: true, sessionId, id: result.id });
        } else {
            // Fallback to file storage
            res.json({ success: true, sessionId, id: null, fallback: true });
        }
    } catch (error) {
        console.error('Error starting evening selection:', error);
        res.status(500).json({ success: false, error: 'Failed to start evening selection' });
    }
});

// Save selections for a specific category
app.post('/api/evening-selection/:sessionId/save', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { category, selections } = req.body;

        if (!eveningService) {
            // Fallback to file storage
            return await saveToFileStorage(sessionId, category, selections, res);
        }

        // Get evening selection
        const eveningSelection = await eveningService.getEveningSelection(sessionId);
        if (!eveningSelection) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        // Save based on category
        switch (category) {
            case 'platforms':
                await eveningService.savePlatformSelections(eveningSelection.id, selections);
                break;
            case 'genres':
                await eveningService.saveGenreSelections(eveningSelection.id, selections);
                break;
            case 'films':
                await eveningService.saveFilmSelections(eveningSelection.id, selections);
                break;
            case 'dishes':
                await eveningService.saveDishSelections(eveningSelection.id, selections);
                break;
            case 'snacks':
                await eveningService.saveSnackSelections(eveningSelection.id, selections);
                break;
            case 'drinks':
                await eveningService.saveDrinkSelections(eveningSelection.id, selections);
                break;
            default:
                return res.status(400).json({ success: false, error: 'Invalid category' });
        }

        res.json({ success: true, message: `${category} saved successfully` });
    } catch (error) {
        console.error(`Error saving ${req.body.category}:`, error);
        res.status(500).json({ success: false, error: `Failed to save ${req.body.category}` });
    }
});

// Complete evening selection
app.post('/api/evening-selection/:sessionId/complete', async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!eveningService) {
            // Fallback to file storage
            return res.json({ success: true, message: 'Evening completed (file storage)' });
        }

        const eveningSelection = await eveningService.getEveningSelection(sessionId);
        if (!eveningSelection) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        await eveningService.completeEveningSelection(eveningSelection.id);
        res.json({ success: true, message: 'Evening selection completed' });
    } catch (error) {
        console.error('Error completing evening selection:', error);
        res.status(500).json({ success: false, error: 'Failed to complete evening selection' });
    }
});

// Get evening selection details
app.get('/api/evening-selection/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!eveningService) {
            // Fallback to file storage
            return await getFromFileStorage(sessionId, res);
        }

        const completeSelection = await eveningService.getCompleteEveningSelection(sessionId);
        if (!completeSelection) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        res.json({ success: true, data: completeSelection });
    } catch (error) {
        console.error('Error getting evening selection:', error);
        res.status(500).json({ success: false, error: 'Failed to get evening selection' });
    }
});

// Get analytics data
app.get('/api/analytics', async (req, res) => {
    try {
        const { type, limit } = req.query;

        if (!eveningService) {
            return res.json({ success: true, data: [], message: 'Analytics not available (file storage mode)' });
        }

        const analytics = await eveningService.getAnalytics(type, parseInt(limit) || 50);
        res.json({ success: true, data: analytics });
    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({ success: false, error: 'Failed to get analytics' });
    }
});

// Get recent selections for admin
app.get('/api/recent-selections', async (req, res) => {
    try {
        const { limit } = req.query;

        if (!eveningService) {
            return await getRecentFromFileStorage(parseInt(limit) || 20, res);
        }

        const recent = await eveningService.getRecentSelections(parseInt(limit) || 20);
        res.json({ success: true, data: recent });
    } catch (error) {
        console.error('Error getting recent selections:', error);
        res.status(500).json({ success: false, error: 'Failed to get recent selections' });
    }
});

// Fallback functions for file storage
async function saveToFileStorage(sessionId, category, selections, res) {
    try {
        let data = {};
        try {
            const fileContent = await fs.readFile(DATA_FILE, 'utf8');
            data = JSON.parse(fileContent);
        } catch (error) {
            // File doesn't exist or is empty
            data = {};
        }

        if (!data[sessionId]) {
            data[sessionId] = {
                sessionId,
                createdAt: new Date().toISOString(),
                status: 'in_progress'
            };
        }

        data[sessionId][category] = selections;
        data[sessionId].updatedAt = new Date().toISOString();

        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true, message: `${category} saved to file storage` });
    } catch (error) {
        console.error('Error saving to file storage:', error);
        res.status(500).json({ success: false, error: 'Failed to save to file storage' });
    }
}

async function getFromFileStorage(sessionId, res) {
    try {
        const fileContent = await fs.readFile(DATA_FILE, 'utf8');
        const data = JSON.parse(fileContent);
        
        if (data[sessionId]) {
            res.json({ success: true, data: data[sessionId], storage: 'file' });
        } else {
            res.status(404).json({ success: false, error: 'Session not found' });
        }
    } catch (error) {
        res.status(404).json({ success: false, error: 'Session not found' });
    }
}

async function getRecentFromFileStorage(limit, res) {
    try {
        const fileContent = await fs.readFile(DATA_FILE, 'utf8');
        const data = JSON.parse(fileContent);
        
        const recent = Object.values(data)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
            
        res.json({ success: true, data: recent, storage: 'file' });
    } catch (error) {
        res.json({ success: true, data: [], storage: 'file' });
    }
}

// Legacy API endpoint for backward compatibility
app.post('/api/save-evening-selection', async (req, res) => {
    try {
        const { selections, timestamp, userAgent } = req.body;
        
        const newEntry = {
            id: Date.now().toString(),
            timestamp: timestamp || new Date().toISOString(),
            selections,
            userAgent: userAgent || 'Unknown',
            ip: req.ip || req.connection.remoteAddress
        };

        // Read existing data
        let data = [];
        try {
            const fileContent = await fs.readFile(DATA_FILE, 'utf8');
            data = JSON.parse(fileContent);
        } catch (error) {
            // File doesn't exist yet, start with empty array
            console.log('Creating new data file');
        }

        // Add new entry
        data.push(newEntry);

        // Keep only last 100 entries to prevent file from getting too large
        if (data.length > 100) {
            data = data.slice(-100);
        }

        // Save back to file
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));

        console.log('New evening saved:', newEntry);
        res.json({ success: true, id: newEntry.id });

    } catch (error) {
        console.error('Error saving evening:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all evening selections (for viewing data)
app.get('/api/evenings', async (req, res) => {
    try {
        const fileContent = await fs.readFile(DATA_FILE, 'utf8');
        const data = JSON.parse(fileContent);
        res.json(data);
    } catch (error) {
        // File doesn't exist yet
        res.json([]);
    }
});

// Get latest evening selection
app.get('/api/latest-evening', async (req, res) => {
    try {
        const fileContent = await fs.readFile(DATA_FILE, 'utf8');
        const data = JSON.parse(fileContent);
        const latest = data[data.length - 1];
        res.json(latest || null);
    } catch (error) {
        res.json(null);
    }
});

// Start server with database initialization
async function startServer() {
    try {
        await initializeDatabase();
        
        app.listen(PORT, () => {
            console.log(`🚀 Date Night API server running on port ${PORT}`);
            console.log(`📱 Open http://localhost:${PORT} to use the app`);
            console.log(`🗄️  Database: ${eveningService ? 'MySQL Connected' : 'File Storage Mode'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down gracefully...');
    try {
        if (dbConfig) {
            await dbConfig.close();
        }
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

startServer();
