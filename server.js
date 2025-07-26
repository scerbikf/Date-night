const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'evening-selections.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Save evening selection
app.post('/api/save-evening', async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Date Night API server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to use the app`);
});
