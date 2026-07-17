document.addEventListener('DOMContentLoaded', () => {
    
    const elements = {
        statTotal: document.getElementById('stat-total'),
        statPending: document.getElementById('stat-pending'),
        statCompleted: document.getElementById('stat-completed'),
        statHigh: document.getElementById('stat-high'),
        taskList: document.getElementById('task-list'),
        searchInput: document.getElementById('search-input'),
        statusFilter: document.getElementById('status-filter'),
        btnCreateTask: document.getElementById('btn-create-task'),
        modal: document.getElementById('task-modal'),
        closeModal: document.getElementById('close-modal'),
        createForm: document.getElementById('create-task-form'),
        themeToggle: document.getElementById('theme-toggle')
    };

    let debounceTimer;

    // Theme Logic
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        elements.themeToggle.textContent = '☀️';
    }

    elements.themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            elements.themeToggle.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            elements.themeToggle.textContent = '☀️';
        }
    });

    // Initialize Dashboard
    fetchDashboardStats();
    fetchTasks();

    // Event Listeners
    elements.btnCreateTask.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Create New Task';
        document.getElementById('task-id').value = '';
        elements.createForm.reset();
        elements.modal.classList.add('active');
    });

    elements.closeModal.addEventListener('click', () => {
        elements.modal.classList.remove('active');
        elements.createForm.reset();
    });

    // Navigation Links
    document.getElementById('nav-dashboard').addEventListener('click', (e) => {
        e.preventDefault();
        elements.statusFilter.value = ''; // Reset filter
        fetchTasks();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    document.getElementById('nav-completed').addEventListener('click', (e) => {
        e.preventDefault();
        elements.statusFilter.value = 'Completed';
        fetchTasks();
        document.querySelector('.tasks-section').scrollIntoView({ behavior: 'smooth' });
    });

    elements.statusFilter.addEventListener('change', () => {
        fetchTasks();
    });

    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim();
            if (query) {
                searchTasks(query);
            } else {
                fetchTasks();
            }
        }, 300);
    });

    elements.createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const taskData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-desc').value,
            priority: document.getElementById('task-priority').value,
            status: document.getElementById('task-status').value
        };

        const taskId = document.getElementById('task-id').value;
        const url = taskId ? `/tasks/${taskId}` : '/tasks';
        const method = taskId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            
            if (res.ok) {
                elements.modal.classList.remove('active');
                elements.createForm.reset();
                fetchDashboardStats();
                fetchTasks();
            } else {
                const err = await res.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    });

    // API Calls
    async function fetchDashboardStats() {
        try {
            const res = await fetch('/dashboard');
            if (res.ok) {
                const data = await res.json();
                
                // Animate counters
                animateValue(elements.statTotal, data.totalTasks);
                animateValue(elements.statPending, data.pending);
                animateValue(elements.statCompleted, data.completed);
                animateValue(elements.statHigh, data.highPriority);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }

    async function fetchTasks() {
        try {
            const status = elements.statusFilter.value;
            let url = '/tasks?limit=50'; // Bring up to 50 for dashboard demo
            if (status) url += `&status=${status}`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                renderTasks(data.tasks);
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    }

    async function searchTasks(keyword) {
        try {
            const res = await fetch(`/tasks/search?keyword=${encodeURIComponent(keyword)}`);
            if (res.ok) {
                const tasks = await res.json();
                renderTasks(tasks);
            }
        } catch (error) {
            console.error('Failed to search tasks:', error);
        }
    }

    async function deleteTask(id) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        try {
            const res = await fetch(`/tasks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchDashboardStats();
                fetchTasks();
            }
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    }

    async function updateTaskStatus(id, status) {
        try {
            const res = await fetch(`/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchDashboardStats();
                fetchTasks();
            }
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    }

    function openEditModal(task) {
        document.getElementById('modal-title').textContent = 'Edit Task';
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-desc').value = task.description;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-status').value = task.status;
        elements.modal.classList.add('active');
    }

    // UI Renderers
    function renderTasks(tasks) {
        elements.taskList.innerHTML = '';

        if (tasks.length === 0) {
            elements.taskList.innerHTML = '<div style="color: var(--text-secondary); text-align: center; padding: 20px;">No tasks found. Create one!</div>';
            return;
        }

        tasks.forEach(task => {
            const statusClass = task.status.replace(' ', '').toLowerCase();
            const priorityClass = task.priority.toLowerCase();

            const item = document.createElement('div');
            item.className = 'task-item';
            item.innerHTML = `
                <div class="task-main">
                    <div class="task-title">${escapeHTML(task.title)}</div>
                    <div class="task-desc">${escapeHTML(task.description || 'No description provided.')}</div>
                </div>
                <div class="task-meta">
                    <span class="badge badge-${priorityClass}">${task.priority}</span>
                    <span class="badge badge-${statusClass}">${task.status}</span>
                    <select class="action-dropdown" data-id="${task.id}">
                        <option value="" disabled selected>Options ⚙️</option>
                        <option value="status_Pending">Mark Pending</option>
                        <option value="status_In Progress">Mark In Progress</option>
                        <option value="status_Completed">Mark Completed</option>
                        <option value="edit">Edit Task ✏️</option>
                        <option value="delete">Delete 🗑️</option>
                    </select>
                </div>
            `;
            elements.taskList.appendChild(item);
        });

        // Attach handlers
        document.querySelectorAll('.action-dropdown').forEach(dropdown => {
            dropdown.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                const action = e.target.value;
                const task = tasks.find(t => t.id == id);
                
                // Reset dropdown to "Options" visually after selection
                e.target.value = "";
                
                if (action === 'edit') {
                    if (task) openEditModal(task);
                } else if (action === 'delete') {
                    deleteTask(id);
                } else if (action.startsWith('status_')) {
                    const newStatus = action.replace('status_', '');
                    updateTaskStatus(id, newStatus);
                }
            });
        });
    }

    // Helper functions
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    function animateValue(obj, end, duration = 1000) {
        let startTimestamp = null;
        const start = parseInt(obj.innerHTML) || 0;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end;
            }
        };
        window.requestAnimationFrame(step);
    }
});
