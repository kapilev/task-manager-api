const TaskModel = require('../models/taskModel');

exports.createTask = async (req, res) => {
    try {
        const { title, description, status, priority } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        
        const validPriorities = ['Low', 'Medium', 'High'];
        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({ error: 'Invalid priority value. Must be Low, Medium, or High.' });
        }

        const validStatuses = ['Pending', 'In Progress', 'Completed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value. Must be Pending, In Progress, or Completed.' });
        }
        
        const taskId = await TaskModel.create(title, description, status, priority);
        
        res.status(201).json({
            message: 'Task created successfully',
            taskId
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const limitVal = parseInt(limit);
        
        const tasks = await TaskModel.findAll(limitVal, offset, status);
        const total = await TaskModel.count(status);
        
        res.status(200).json({
            tasks,
            pagination: {
                total,
                page: parseInt(page),
                limit: limitVal,
                totalPages: Math.ceil(total / limitVal)
            }
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.searchTasks = async (req, res) => {
    try {
        const { keyword } = req.query;
        
        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required for search' });
        }
        
        const results = await TaskModel.search(keyword);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error searching tasks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await TaskModel.findById(id);
        
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.status(200).json(task);
    } catch (error) {
        console.error('Error fetching task by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority } = req.body;
        
        const validPriorities = ['Low', 'Medium', 'High'];
        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({ error: 'Invalid priority value' });
        }

        const validStatuses = ['Pending', 'In Progress', 'Completed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        
        const existing = await TaskModel.findById(id);
        if (!existing) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        const updatedTask = await TaskModel.update(id, title, description, status, priority);
        
        res.status(200).json({
            message: 'Task updated successfully',
            task: updatedTask
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await TaskModel.delete(id);
        
        if (!success) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const stats = await TaskModel.getDashboardStats();
        
        res.status(200).json({
            totalTasks: Number(stats.totalTasks) || 0,
            pending: Number(stats.pending) || 0,
            completed: Number(stats.completed) || 0,
            highPriority: Number(stats.highPriority) || 0
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
