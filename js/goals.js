/**
 * LifeOS Goals Module
 * Track long-term aspirations, milestones, and target completion dates
 */

document.addEventListener('DOMContentLoaded', async () => {
  const goalsGrid = document.getElementById('goalsGrid');
  const goalForm = document.getElementById('goalForm');

  async function fetchAndRenderGoals() {
    if (!goalsGrid) return;
    try {
      let goals;
      if (window.apiService && window.apiService.goals) {
        goals = await window.apiService.goals.getAll();
      } else {
        goals = await LifeOS_API.goals.list();
      }

      if (goals.length === 0) {
        goalsGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">🎯</div>
            <div class="empty-state-title">No goals set yet</div>
            <div class="empty-state-desc">Set ambitious goals and break them down into actionable milestones.</div>
            <button class="btn btn-primary btn-sm" onclick="LifeOS_Common.openModal('goalModal')">+ Add Goal</button>
          </div>
        `;
        return;
      }

      goalsGrid.innerHTML = goals.map(g => {
        const milestones = g.milestones || ['Planning', 'In Progress', 'Testing', 'Completed'];
        return `
          <div class="card" style="display: flex; flex-direction: column;">
            <div class="card-header">
              <div>
                <span class="badge badge-purple" style="margin-bottom: 4px;">${g.category || 'General'}</span>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--text-primary);">${g.title}</h4>
              </div>
              <span style="font-size: 16px; font-weight: 800; color: var(--primary);">${g.progress}%</span>
            </div>

            <div class="card-body" style="flex: 1; display: flex; flex-direction: column; gap: 14px;">
              <div class="goal-progress-bar" style="height: 8px;">
                <div class="goal-progress-fill fill-blue" style="width: ${g.progress}%;"></div>
              </div>

              <div style="font-size: 12px; color: var(--text-secondary); display: flex; justify-content: space-between;">
                <span>Target: <strong>${g.target_date || '2025-12-31'}</strong></span>
                <span>Status: <strong class="badge ${g.progress >= 100 ? 'badge-low' : 'badge-primary'}">${g.status || 'Active'}</strong></span>
              </div>

              <!-- Milestones checklist -->
              <div style="background-color: var(--bg-surface-subtle); padding: 12px; border-radius: var(--radius-md);">
                <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase;">Key Milestones</div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${milestones.map((m, i) => {
                    const isDone = (i + 1) / milestones.length <= (g.progress / 100);
                    return `
                      <span class="badge ${isDone ? 'badge-low' : 'badge-primary'}" style="font-size: 11px;">
                        ${isDone ? '✓ ' : '○ '}${m}
                      </span>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Quick Progress Adjustment Slider -->
              <div style="margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <label style="font-size: 11px; color: var(--text-muted);">Adjust Progress:</label>
                <div style="display: flex; align-items: center; gap: 8px; flex: 1; max-width: 180px;">
                  <input type="range" min="0" max="100" value="${g.progress}" 
                         style="width: 100%; accent-color: var(--primary); cursor: pointer;"
                         onchange="updateGoalProgress(${g.id}, this.value)" />
                  <span style="font-size: 12px; font-weight: 600; min-width: 32px;">${g.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.error('Goals error', err);
    }
  }
  window.fetchAndRenderGoals = fetchAndRenderGoals;

  window.updateGoalProgress = async (id, progress) => {
    if (window.apiService && window.apiService.goals) {
      await window.apiService.goals.updateProgress(id, Number(progress));
    } else {
      await LifeOS_API.goals.updateProgress(id, Number(progress));
    }
    LifeOS_Common.showToast(`Goal updated to ${progress}%`, 'success');
    await fetchAndRenderGoals();
  };

  if (goalForm) {
    goalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('goalTitle').value.trim();
      const category = document.getElementById('goalCategory').value;
      const target_date = document.getElementById('goalTargetDate').value;
      const progress = Number(document.getElementById('goalInitialProgress').value) || 0;
      const milestonesRaw = document.getElementById('goalMilestones').value;

      if (!title) return;

      const milestones = milestonesRaw ? milestonesRaw.split(',').map(m => m.trim()).filter(Boolean) : [];

      if (window.apiService && window.apiService.goals) {
        await window.apiService.goals.create({ title, category, target_date, progress, milestones });
      } else {
        await LifeOS_API.goals.create({ title, category, target_date, progress, milestones });
      }
      LifeOS_Common.closeModal('goalModal');
      goalForm.reset();
      LifeOS_Common.showToast('Goal created successfully!', 'success');
      await fetchAndRenderGoals();
    });
  }

  await fetchAndRenderGoals();
});
