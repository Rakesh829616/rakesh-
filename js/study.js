/**
 * LifeOS Study Management Module
 * Subjects, topics, study session logger, and duration analytics
 */

document.addEventListener('DOMContentLoaded', async () => {
  const studyList = document.getElementById('studyBreakdownList');
  const sessionForm = document.getElementById('logSessionForm');

  async function loadStudyData() {
    try {
      const summary = await LifeOS_API.study.getSummary();

      // Total Today Display
      const hours = Math.floor(summary.total_today_minutes / 60);
      const mins = summary.total_today_minutes % 60;
      const todayEl = document.getElementById('studyTodayTotal');
      if (todayEl) todayEl.textContent = `${hours}h ${mins}m`;

      const weekEl = document.getElementById('studyWeekTotal');
      if (weekEl) weekEl.textContent = summary.total_week_hours;

      // Subject Breakdown List
      if (studyList) {
        studyList.innerHTML = summary.subjects.map(s => `
          <div class="card" style="margin-bottom: 12px;">
            <div class="card-body" style="padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${s.color};"></span>
                <div>
                  <h4 style="font-size: 14px; font-weight: 600; color: var(--text-primary);">${s.name}</h4>
                  <span style="font-size: 11px; color: var(--text-muted);">${s.percentage}% of weekly focus</span>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">${s.minutes_today} min</div>
                <span style="font-size: 11px; color: var(--text-light);">Today</span>
              </div>
            </div>
          </div>
        `).join('');
      }

      // Render Chart if Canvas exists
      const canvas = document.getElementById('studyPageChart');
      if (canvas && typeof Chart !== 'undefined') {
        new Chart(canvas, {
          type: 'bar',
          data: {
            labels: summary.subjects.map(s => s.name),
            datasets: [{
              label: 'Minutes Studied Today',
              data: summary.subjects.map(s => s.minutes_today),
              backgroundColor: summary.subjects.map(s => s.color),
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Minutes' } }
            }
          }
        });
      }
    } catch (err) {
      console.error('Study load error', err);
    }
  }

  if (sessionForm) {
    sessionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const subject = document.getElementById('sessionSubject').value;
      const minutes = Number(document.getElementById('sessionMinutes').value);

      if (!subject || !minutes) return;

      await LifeOS_API.study.logSession(subject, minutes);
      LifeOS_Common.closeModal('sessionModal');
      sessionForm.reset();
      LifeOS_Common.showToast(`Logged ${minutes} min of ${subject}!`, 'success');
      await loadStudyData();
    });
  }

  await loadStudyData();
});
