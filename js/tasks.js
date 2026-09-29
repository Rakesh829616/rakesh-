/**
 * LifeOS Tasks Module
 * Full CRUD, Status filtering (Todo, In Progress, Completed), Priorities, Due Dates
 */

document.addEventListener('DOMContentLoaded', async () => {
  let allTasks = [];
  let currentFilter = 'All';
  let currentSearch = '';

  const tableBody = document.getElementById('tasksTableBody');
  const searchInput = document.getElementById('taskSearchInput');
  const statusFilter = document.getElementById('taskStatusFilter');
  const priorityFilter = document.getElementById('taskPriorityFilter');
  const taskModal = document.getElementById('taskModal');
  const taskForm = document.getElementById('taskForm');

  async function fetchAndRenderTasks() {
    try {
      if (window.apiService && window.apiService.tasks) {
        allTasks = await window.apiService.tasks.getAll();
      } else {
        allTasks = await LifeOS_API.tasks.list();
      }
      
      // Update sidebar task badge
      const badge = document.getElementById('sidebarTaskBadge');
      if (badge) {
        const activeCount = allTasks.filter(t => !t.completed).length;
        badge.textContent = activeCount;
      }
      
      renderTasks();
    } catch (err) {
      if (tableBody) tableBody.innerHTML = '<tr><td colspan="6" class="form-error">Error loading tasks from API backend</td></tr>';
    }
  }
  window.fetchAndRenderTasks = fetchAndRenderTasks;

  function renderTasks() {
    if (!tableBody) return;

    let filtered = allTasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
                          (t.category && t.category.toLowerCase().includes(currentSearch.toLowerCase()));
      const matchStatus = currentFilter === 'All' || t.status === currentFilter || (currentFilter === 'Completed' && t.completed);
      const matchPriority = !priorityFilter || priorityFilter.value === 'All' || t.priority === priorityFilter.value;
      return matchSearch && matchStatus && matchPriority;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-state-icon">📋</div>
              <div class="empty-state-title">No tasks found</div>
              <div class="empty-state-desc">Create your first task or change filter criteria.</div>
              <button class="btn btn-primary btn-sm" onclick="LifeOS_Common.openModal('taskModal')">+ Add Task</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(t => {
      const priorityBadge = t.priority === 'High' ? 'badge-high' : t.priority === 'Medium' ? 'badge-medium' : 'badge-low';
      const statusBadge = t.completed ? 'badge-low' : t.status === 'In Progress' ? 'badge-primary' : 'badge-medium';

      return `
        <tr>
          <td style="width: 40px;">
            <div class="task-checkbox-custom ${t.completed ? 'completed' : ''}" onclick="toggleTaskCompletion(${t.id})">
              ${t.completed ? '✓' : ''}
            </div>
          </td>
          <td>
            <div class="task-text ${t.completed ? 'completed' : ''}" style="font-weight: 600;">${t.title}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${t.category || 'General'}</div>
          </td>
          <td><span class="badge ${priorityBadge}">${t.priority}</span></td>
          <td><span class="badge ${statusBadge}">${t.status}</span></td>
          <td style="font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary);">
            ${t.due_date || 'Today'} ${t.due_time ? '• ' + t.due_time : ''}
          </td>
          <td class="actions-cell">
            <button class="action-icon-btn danger" title="Delete Task" onclick="deleteTask(${t.id})">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.toggleTaskCompletion = async (id) => {
    if (window.apiService && window.apiService.tasks) {
      await window.apiService.tasks.toggle(id);
    } else {
      await LifeOS_API.tasks.toggle(id);
    }
    LifeOS_Common.showToast('Task status updated', 'success');
    await fetchAndRenderTasks();
  };

  window.deleteTask = async (id) => {
    if (confirm('Delete this task?')) {
      if (window.apiService && window.apiService.tasks) {
        await window.apiService.tasks.delete(id);
      } else {
        await LifeOS_API.tasks.delete(id);
      }
      LifeOS_Common.showToast('Task deleted', 'info');
      await fetchAndRenderTasks();
    }
  };

  // Filter Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim();
      renderTasks();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      currentFilter = e.target.value;
      renderTasks();
    });
  }

  if (priorityFilter) {
    priorityFilter.addEventListener('change', () => {
      renderTasks();
    });
  }

  // Task Form Submit
  if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('taskTitle').value.trim();
      const priority = document.getElementById('taskPriority').value;
      const category = document.getElementById('taskCategory').value;
      const due_date = document.getElementById('taskDueDate').value;
      const due_time = document.getElementById('taskDueTime').value || '12:00 PM';
      const status = document.getElementById('taskStatus').value || 'Todo';

      if (!title) {
        LifeOS_Common.showToast('Task title is required', 'error');
        return;
      }

      if (window.apiService && window.apiService.tasks) {
        await window.apiService.tasks.create({ title, priority, category, due_date, due_time, status, completed: status === 'Completed' });
      } else {
        await LifeOS_API.tasks.create({ title, priority, category, due_date, due_time, status });
      }
      LifeOS_Common.closeModal('taskModal');
      taskForm.reset();
      LifeOS_Common.showToast('Task created successfully!', 'success');
      await fetchAndRenderTasks();
    });
  }

  await fetchAndRenderTasks();
});
