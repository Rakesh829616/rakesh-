/**
 * LifeOS Dashboard Controller
 * Matches the reference image layout and interactions
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize all dashboard widgets
  await loadSummaryKpis();
  await loadTodaysTasks();
  await loadGoalsProgress();
  await loadHabitTracker();
  await loadStudyChart();
  await loadFinanceOverview();
  await loadRecentNotes();
  await loadNotifications();
  initMiniCalendar();
  initDashboardPomodoro();
  setupQuickActionModals();
});

// 1. Top 5 Summary KPIs
async function loadSummaryKpis() {
  try {
    const tasks = window.apiService && window.apiService.tasks ? await window.apiService.tasks.getAll() : await LifeOS_API.tasks.list();
    const goals = window.apiService && window.apiService.goals ? await window.apiService.goals.getAll() : await LifeOS_API.goals.list();
    const habits = window.apiService && window.apiService.habits ? await window.apiService.habits.getAll() : await LifeOS_API.habits.list();
    const study = await LifeOS_API.study.getSummary();
    const finance = window.apiService && window.apiService.expenses ? await window.apiService.expenses.getOverview() : await LifeOS_API.finance.getOverview();

    // Tasks KPI
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const activeTasks = tasks.filter(t => !t.completed).length;
    const kpiTasksVal = document.getElementById('kpiTasksVal');
    const kpiTasksSub = document.getElementById('kpiTasksSub');
    if (kpiTasksVal) kpiTasksVal.textContent = totalTasks;
    if (kpiTasksSub) kpiTasksSub.textContent = `${completedTasks} completed`;

    // Sidebar badge sync
    const sidebarBadge = document.getElementById('sidebarTaskBadge');
    if (sidebarBadge) sidebarBadge.textContent = activeTasks;

    // Goals KPI
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.progress >= 100).length;
    const kpiGoalsVal = document.getElementById('kpiGoalsVal');
    const kpiGoalsSub = document.getElementById('kpiGoalsSub');
    if (kpiGoalsVal) kpiGoalsVal.textContent = totalGoals;
    if (kpiGoalsSub) kpiGoalsSub.textContent = `${completedGoals} completed`;

    // Habits KPI
    const completedHabitsToday = habits.filter(h => h.completed_today).length;
    const kpiHabitsVal = document.getElementById('kpiHabitsVal');
    if (kpiHabitsVal) kpiHabitsVal.textContent = `${completedHabitsToday}/${habits.length}`;

    // Study KPI
    const studyHours = Math.floor(study.total_today_minutes / 60);
    const studyMins = study.total_today_minutes % 60;
    const kpiStudyVal = document.getElementById('kpiStudyVal');
    if (kpiStudyVal) kpiStudyVal.textContent = `${studyHours}h ${studyMins}m`;

    // Expenses KPI
    const kpiExpensesVal = document.getElementById('kpiExpensesVal');
    if (kpiExpensesVal) kpiExpensesVal.textContent = `${finance.currency || '₹'}${finance.today_expense || 0}`;
  } catch (err) {
    console.error('Failed to load summary KPIs', err);
  }
}

// 2. Today's Tasks
async function loadTodaysTasks() {
  const container = document.getElementById('todaysTasksList');
  if (!container) return;

  try {
    const tasks = window.apiService && window.apiService.tasks ? await window.apiService.tasks.getAll() : await LifeOS_API.tasks.list();
    const todayTasks = tasks.slice(0, 5);

    if (todayTasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-title">No tasks for today</div>
          <div class="empty-state-desc">Create your first task and start organizing your day.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = todayTasks.map(t => {
      const priorityClass = t.priority === 'High' ? 'badge-high' : t.priority === 'Medium' ? 'badge-medium' : 'badge-low';
      return `
        <div class="task-item-simple">
          <div class="task-checkbox-custom ${t.completed ? 'completed' : ''}" onclick="toggleTaskStatus(${t.id})">
            ${t.completed ? '✓' : ''}
          </div>
          <span class="task-text ${t.completed ? 'completed' : ''}">${t.title}</span>
          <span class="badge ${priorityClass}">${t.priority}</span>
          <span class="task-time">${t.due_time}</span>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<div class="form-error">Unable to load tasks</div>';
  }
}

window.toggleTaskStatus = async function(id) {
  if (window.apiService && window.apiService.tasks) {
    await window.apiService.tasks.toggle(id);
  } else {
    await LifeOS_API.tasks.toggle(id);
  }
  await loadTodaysTasks();
  await loadSummaryKpis();
  LifeOS_Common.showToast('Task updated', 'success');
};

// 3. Goals Progress
async function loadGoalsProgress() {
  const container = document.getElementById('goalsProgressList');
  if (!container) return;

  try {
    const goals = window.apiService && window.apiService.goals ? await window.apiService.goals.getAll() : await LifeOS_API.goals.list();
    const displayGoals = goals.slice(0, 5);
    const colors = ['fill-blue', 'fill-purple', 'fill-orange', 'fill-teal', 'fill-blue'];
    const icons = ['</>', '📖', '🚀', '🗄️', '💼'];

    container.innerHTML = displayGoals.map((g, idx) => {
      const fillClass = colors[idx % colors.length];
      const icon = icons[idx % icons.length];
      return `
        <div class="goal-item-simple">
          <div class="goal-header-line">
            <div class="goal-title-wrap">
              <span>${icon}</span>
              <span>${g.title}</span>
            </div>
            <span class="goal-pct">${g.progress}%</span>
          </div>
          <div class="goal-progress-bar">
            <div class="goal-progress-fill ${fillClass}" style="width: ${g.progress}%"></div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<div class="form-error">Unable to load goals</div>';
  }
}

// 4. Habit Tracker
async function loadHabitTracker() {
  const container = document.getElementById('habitTrackerList');
  if (!container) return;

  try {
    const habits = window.apiService && window.apiService.habits ? await window.apiService.habits.getAll() : await LifeOS_API.habits.list();
    const displayHabits = habits.slice(0, 4);

    container.innerHTML = displayHabits.map(h => {
      return `
        <div class="habit-item-row">
          <div class="habit-meta">
            <div class="habit-icon">${h.icon}</div>
            <div>
              <div class="habit-name">${h.name}</div>
              <div class="habit-streak">🔥 ${h.streak} day streak</div>
            </div>
          </div>
          <div class="habit-dots-row">
            ${h.history.map((checked, i) => `
              <div class="habit-dot ${checked ? 'checked' : ''}" title="Day ${i+1}">
                ${checked ? '✓' : '○'}
              </div>
            `).join('')}
            <button class="btn btn-sm ${h.completed_today ? 'btn-secondary' : 'btn-primary'}" 
                    style="margin-left: 8px; padding: 3px 8px; font-size: 11px;"
                    onclick="toggleHabit(${h.id})">
              ${h.completed_today ? 'Done ✓' : 'Log'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<div class="form-error">Unable to load habits</div>';
  }
}

window.toggleHabit = async function(id) {
  if (window.apiService && window.apiService.habits) {
    await window.apiService.habits.complete(id);
  } else {
    await LifeOS_API.habits.toggleToday(id);
  }
  await loadHabitTracker();
  await loadSummaryKpis();
  LifeOS_Common.showToast('Habit streak updated!', 'success');
};

// 5. Study Statistics Donut Chart
async function loadStudyChart() {
  const canvas = document.getElementById('studyDonutChart');
  if (!canvas || typeof Chart === 'undefined') return;

  try {
    const study = await LifeOS_API.study.getSummary();
    const labels = study.subjects.map(s => s.name);
    const data = study.subjects.map(s => s.percentage);
    const bgColors = study.subjects.map(s => s.color);

    // Update legend
    const legendContainer = document.getElementById('studyLegendList');
    if (legendContainer) {
      legendContainer.innerHTML = study.subjects.map(s => `
        <div class="study-legend-item">
          <div class="legend-color-tag">
            <span class="legend-dot" style="background-color: ${s.color};"></span>
            <span>${s.name}</span>
          </div>
          <span class="legend-pct">${s.percentage}%</span>
        </div>
      `).join('');
    }

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.raw}%`
            }
          }
        },
        cutout: '72%'
      }
    });
  } catch (err) {
    console.error('Study chart failed', err);
  }
}

// 6. Finance Overview Line Chart
async function loadFinanceOverview() {
  const canvas = document.getElementById('financeLineChart');
  if (!canvas || typeof Chart === 'undefined') return;

  try {
    const fin = window.apiService && window.apiService.expenses ? await window.apiService.expenses.getOverview() : await LifeOS_API.finance.getOverview();

    // Populate mini stats
    const incomeEl = document.getElementById('financeIncomeStat');
    const expenseEl = document.getElementById('financeExpenseStat');
    const savingsEl = document.getElementById('financeSavingsStat');
    if (incomeEl) incomeEl.textContent = `${fin.currency}${fin.monthly_income.toLocaleString()}`;
    if (expenseEl) expenseEl.textContent = `${fin.currency}${fin.monthly_expenses.toLocaleString()}`;
    if (savingsEl) savingsEl.textContent = `${fin.currency}${fin.monthly_savings.toLocaleString()}`;

    // Line Chart
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Sep 1', 'Sep 8', 'Sep 15', 'Sep 22', 'Sep 29'],
        datasets: [
          {
            label: 'Income',
            data: [15000, 15000, 18000, 22000, 25000],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            fill: true,
            tension: 0.35,
            pointRadius: 3
          },
          {
            label: 'Expenses',
            data: [3200, 4800, 6100, 7200, 8450],
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.08)',
            fill: true,
            tension: 0.35,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: { boxWidth: 8, font: { size: 10 } }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 }, callback: v => `₹${v/1000}k` } }
        }
      }
    });
  } catch (err) {
    console.error('Finance chart failed', err);
  }
}

// 7. Recent Notes
async function loadRecentNotes() {
  const container = document.getElementById('recentNotesList');
  if (!container) return;

  try {
    const notes = await LifeOS_API.notes.list();
    const displayNotes = notes.slice(0, 3);

    container.innerHTML = displayNotes.map(n => `
      <a href="notes.html" class="note-item-simple">
        <div class="note-title-left">
          <span>📄</span>
          <span>${n.title}</span>
        </div>
        <span class="note-date">${n.updated_at}</span>
      </a>
    `).join('');
  } catch (err) {
    container.innerHTML = '<div class="form-error">Unable to load notes</div>';
  }
}

// 8. Recent Notifications
async function loadNotifications() {
  const container = document.getElementById('recentNotificationsList');
  if (!container) return;

  try {
    const notifs = await LifeOS_API.notifications.list();
    container.innerHTML = notifs.map(n => `
      <div class="notif-item">
        <div class="notif-icon">${n.icon}</div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Notifs error', err);
  }
}

// 9. Mini Calendar
function initMiniCalendar() {
  const grid = document.getElementById('miniCalendarGrid');
  if (!grid) return;

  const daysInMonth = 30; // September
  const startDayOffset = 1; // Monday start
  const eventDays = [8, 15, 16, 22, 29, 30]; // Days with events

  let cells = '';
  // Days of week
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  cells += dayNames.map(d => `<div class="cal-day-label">${d}</div>`).join('');

  // Leading empty
  for (let i = 0; i < startDayOffset; i++) {
    cells += `<div class="cal-day-cell other-month">${31 - startDayOffset + i + 1}</div>`;
  }

  // Days 1 to 30
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === 29;
    const hasEvents = eventDays.includes(day);
    cells += `
      <div class="cal-day-cell ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}">
        ${day}
      </div>
    `;
  }

  grid.innerHTML = cells;
}

// 10. Dashboard Pomodoro Widget
let pomoTimerInterval = null;
let pomoSecondsLeft = 25 * 60;
let pomoIsRunning = false;

function initDashboardPomodoro() {
  const timerDisplay = document.getElementById('dashPomoDisplay');
  const playBtn = document.getElementById('dashPomoPlayBtn');
  const resetBtn = document.getElementById('dashPomoResetBtn');
  const selector = document.getElementById('dashPomoPreset');

  if (!timerDisplay) return;

  function updateDisplay() {
    const mins = Math.floor(pomoSecondsLeft / 60);
    const secs = pomoSecondsLeft % 60;
    timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (pomoIsRunning) {
        clearInterval(pomoTimerInterval);
        pomoIsRunning = false;
        playBtn.textContent = '▶';
      } else {
        pomoIsRunning = true;
        playBtn.textContent = '⏸';
        pomoTimerInterval = setInterval(() => {
          if (pomoSecondsLeft > 0) {
            pomoSecondsLeft--;
            updateDisplay();
          } else {
            clearInterval(pomoTimerInterval);
            pomoIsRunning = false;
            playBtn.textContent = '▶';
            LifeOS_Common.showToast('Pomodoro completed! Take a 5-minute break.', 'success');
            LifeOS_API.study.logSession('Pomodoro Deep Work', 25);
            loadSummaryKpis();
          }
        }, 1000);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearInterval(pomoTimerInterval);
      pomoIsRunning = false;
      if (playBtn) playBtn.textContent = '▶';
      pomoSecondsLeft = (selector ? Number(selector.value) : 25) * 60;
      updateDisplay();
    });
  }

  if (selector) {
    selector.addEventListener('change', () => {
      clearInterval(pomoTimerInterval);
      pomoIsRunning = false;
      if (playBtn) playBtn.textContent = '▶';
      pomoSecondsLeft = Number(selector.value) * 60;
      updateDisplay();
    });
  }
}

// 11. Quick Action Modals Wireup
function setupQuickActionModals() {
  const addTaskForm = document.getElementById('quickAddTaskForm');
  if (addTaskForm) {
    addTaskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('quickTaskTitle').value.trim();
      const priority = document.getElementById('quickTaskPriority').value;
      const due_time = document.getElementById('quickTaskTime').value || '12:00 PM';
      const category = document.getElementById('quickTaskCategory').value;

      if (!title) return;

      if (window.apiService && window.apiService.tasks) {
        await window.apiService.tasks.create({ title, priority, due_time, category, status: 'Todo' });
      } else {
        await LifeOS_API.tasks.create({ title, priority, due_time, category, status: 'Todo' });
      }
      LifeOS_Common.closeModal('quickTaskModal');
      addTaskForm.reset();
      LifeOS_Common.showToast('Task created successfully!', 'success');
      await loadTodaysTasks();
      await loadSummaryKpis();
    });
  }

  const addExpenseForm = document.getElementById('quickAddExpenseForm');
  if (addExpenseForm) {
    addExpenseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('quickExpenseTitle').value.trim();
      const amount = Number(document.getElementById('quickExpenseAmount').value);
      const category = document.getElementById('quickExpenseCategory').value;
      const type = document.getElementById('quickExpenseType').value;

      if (!title || !amount) return;

      if (window.apiService && window.apiService.expenses) {
        await window.apiService.expenses.create({ title, amount, category, type, payment_method: 'UPI' });
      } else {
        await LifeOS_API.finance.addTransaction({ title, amount, category, type, payment_method: 'UPI' });
      }
      LifeOS_Common.closeModal('quickExpenseModal');
      addExpenseForm.reset();
      LifeOS_Common.showToast('Transaction logged successfully!', 'success');
      await loadFinanceOverview();
      await loadSummaryKpis();
    });
  }
}
