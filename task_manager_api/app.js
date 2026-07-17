require('dotenv').config();
const express = require('express');
const path = require('path');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static dashboard files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/tasks', taskRoutes);

// Bonus Optional Route: Dashboard aggregates
const taskController = require('./controllers/taskController');
app.get('/dashboard', taskController.getDashboard);

// 404 Handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke on the server!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
