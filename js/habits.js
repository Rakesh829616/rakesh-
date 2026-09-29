/**
 * LifeOS Habits Module
 * Habit formation, streaks 🔥, weekly completion dots, daily logs
 */

document.addEventListener('DOMContentLoaded', async () => {
  const habitsContainer = document.getElementById('habitsContainer');
  const habitForm = document.getElementById('habitForm');

  async function fetchAndRenderHabits() {
    if (!habitsContainer) return;

    try {
      let habits;
      if (window.apiService && window.apiService.habits) {
        habits = await window.apiService.habits.getAll();
      } else {
        habits = await LifeOS_API.habits.list();
      }

      if (habits.length === 0) {
        habitsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🔥</div>
            <div class="empty-state-title">No habits tracked yet</div>
            <div class="empty-state-desc">Build consistency by logging your daily atomic habits.</div>
            <button class="btn btn-primary btn-sm" onclick="LifeOS_Common.openModal('habitModal')">+ Add Habit</button>
          </div>
        `;
        return;
      }

      habitsContainer.innerHTML = habits.map(h => {
        const completedDays = h.history.filter(Boolean).length;
        const completionRate = Math.round((completedDays / 7) * 100);

        return `
          <div class="card" style="margin-bottom: 16px;">
            <div class="card-body" style="display: flex; flex-direction: column; gap: 14px;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div class="habit-icon" style="width: 38px; height: 38px; font-size: 18px;">${h.icon}</div>
                  <div>
                    <h4 style="font-size: 15px; font-weight: 700; color: var(--text-primary);">${h.name}</h4>
                    <span style="font-size: 12px; color: #ea580c; font-weight: 600;">🔥 ${h.streak} day streak</span>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 16px;">
                  <div style="text-align: right;">
                    <div style="font-size: 11px; color: var(--text-muted);">Weekly Consistency</div>
                    <div style="font-size: 14px; font-weight: 700; color: var(--primary);">${completionRate}%</div>
                  </div>

                  <button class="btn btn-sm ${h.completed_today ? 'btn-secondary' : 'btn-primary'}" 
                          onclick="toggleHabitStatus(${h.id})">
                    ${h.completed_today ? 'Completed Today ✓' : 'Mark Done Today'}
                  </button>
                </div>
              </div>

              <!-- 7 Day History Dots -->
              <div style="background-color: var(--bg-surface-subtle); padding: 12px 16px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 12px; font-weight: 500; color: var(--text-secondary);">Last 7 Days Activity:</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => `
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                      <span style="font-size: 10px; color: var(--text-muted);">${day}</span>
                      <div class="habit-dot ${h.history[i] ? 'checked' : ''}" style="width: 22px; height: 22px;">
                        ${h.history[i] ? '✓' : '○'}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.error('Habits load error', err);
    }
  }
  window.fetchAndRenderHabits = fetchAndRenderHabits;

  window.toggleHabitStatus = async (id) => {
    if (window.apiService && window.apiService.habits) {
      await window.apiService.habits.complete(id);
    } else {
      await LifeOS_API.habits.toggleToday(id);
    }
    LifeOS_Common.showToast('Habit updated!', 'success');
    await fetchAndRenderHabits();
  };

  if (habitForm) {
    habitForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('habitName').value.trim();
      const icon = document.getElementById('habitIcon').value.trim() || '🔥';
      const target_days = Number(document.getElementById('habitTargetDays').value) || 7;

      if (!name) return;

      if (window.apiService && window.apiService.habits) {
        await window.apiService.habits.create({ name, icon, target_days });
      } else {
        await LifeOS_API.habits.create({ name, icon, target_days });
      }
      LifeOS_Common.closeModal('habitModal');
      habitForm.reset();
      LifeOS_Common.showToast('Habit added!', 'success');
      await fetchAndRenderHabits();
    });
  }

  await fetchAndRenderHabits();
});
