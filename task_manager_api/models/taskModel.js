const pool = require('../config/db');

class TaskModel {
    static async create(title, description, status, priority) {
        const query = `
            INSERT INTO tasks (title, description, status, priority) 
            VALUES (?, ?, COALESCE(?, 'Pending'), COALESCE(?, 'Medium'))
        `;
        const values = [title, description || null, status || null, priority || null];
        const [result] = await pool.execute(query, values);
        return result.insertId;
    }

    static async findAll(limit, offset, status) {
        let query = 'SELECT * FROM tasks';
        const queryParams = [];
        
        if (status) {
            query += ' WHERE status = ?';
            queryParams.push(status);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        
        const finalParams = status ? [status, limit, offset] : [limit, offset];
        const [results] = await pool.query(query, finalParams);
        return results;
    }

    static async count(status) {
        let countQuery = 'SELECT COUNT(*) as total FROM tasks';
        const countParams = [];
        if (status) {
            countQuery += ' WHERE status = ?';
            countParams.push(status);
        }
        const [[{total}]] = await pool.query(countQuery, countParams);
        return total;
    }

    static async findById(id) {
        const [results] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);
        return results[0] || null;
    }

    static async update(id, title, description, status, priority) {
        const query = `
            UPDATE tasks 
            SET title = COALESCE(?, title),
                description = COALESCE(?, description),
                status = COALESCE(?, status),
                priority = COALESCE(?, priority)
            WHERE id = ?
        `;
        
        await pool.execute(query, [
            title !== undefined ? title : null, 
            description !== undefined ? description : null, 
            status !== undefined ? status : null, 
            priority !== undefined ? priority : null, 
            id
        ]);
        
        return this.findById(id);
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async search(keyword) {
        const query = `
            SELECT * FROM tasks 
            WHERE title LIKE ? OR description LIKE ?
            ORDER BY created_at DESC
        `;
        const searchPattern = `%${keyword}%`;
        const [results] = await pool.execute(query, [searchPattern, searchPattern]);
        return results;
    }

    static async getDashboardStats() {
        const query = `
            SELECT 
                COUNT(*) as totalTasks,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END) as highPriority
            FROM tasks
        `;
        const [results] = await pool.execute(query);
        return results[0];
    }
}

module.exports = TaskModel;
