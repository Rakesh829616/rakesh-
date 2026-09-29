/**
 * LifeOS Pomodoro Focus Module
 * 25/5, 50/10, Custom timer, task link, and deep work tracking
 */

document.addEventListener('DOMContentLoaded', async () => {
  let timerInterval = null;
  let secondsRemaining = 25 * 60;
  let isRunning = false;
  let currentMode = 'focus'; // 'focus' | 'break'
  let completedTodayCount = 4;

  const display = document.getElementById('pomoTimeDisplay');
  const startBtn = document.getElementById('pomoStartBtn');
  const pauseBtn = document.getElementById('pomoPauseBtn');
  const resetBtn = document.getElementById('pomoResetBtn');
  const taskSelect = document.getElementById('pomoTaskSelect');
  const modeStatus = document.getElementById('pomoModeStatus');
  const sessionCountEl = document.getElementById('pomoCompletedCount');

  // Load user tasks into selector
  if (taskSelect) {
    const tasks = await LifeOS_API.tasks.list();
    taskSelect.innerHTML = `
      <option value="">-- Associate with a Task (Optional) --</option>
      ${tasks.filter(t => !t.completed).map(t => `<option value="${t.title}">${t.title}</option>`).join('')}
    `;
  }

  function updateTimerDisplay() {
    if (!display) return;
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    const text = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    display.textContent = text;
    document.title = isRunning ? `(${text}) Pomodoro Focus - LifeOS` : 'Pomodoro - LifeOS';
  }

  function playAlertSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (isRunning) return;
      isRunning = true;
      startBtn.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'inline-flex';

      timerInterval = setInterval(() => {
        if (secondsRemaining > 0) {
          secondsRemaining--;
          updateTimerDisplay();
        } else {
          clearInterval(timerInterval);
          isRunning = false;
          startBtn.style.display = 'inline-flex';
          if (pauseBtn) pauseBtn.style.display = 'none';
          playAlertSound();

          if (currentMode === 'focus') {
            completedTodayCount++;
            if (sessionCountEl) sessionCountEl.textContent = completedTodayCount;
            LifeOS_Common.showToast('Pomodoro completed! Enjoy a 5-minute break.', 'success');
            const linkedTask = taskSelect ? taskSelect.value : 'Focus Session';
            LifeOS_API.study.logSession(linkedTask || 'Pomodoro', 25);
            setMode('break', 5);
          } else {
            LifeOS_Common.showToast('Break over! Ready to focus again?', 'info');
            setMode('focus', 25);
          }
        }
      }, 1000);
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      clearInterval(timerInterval);
      isRunning = false;
      pauseBtn.style.display = 'none';
      if (startBtn) startBtn.style.display = 'inline-flex';
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearInterval(timerInterval);
      isRunning = false;
      if (pauseBtn) pauseBtn.style.display = 'none';
      if (startBtn) startBtn.style.display = 'inline-flex';
      secondsRemaining = 25 * 60;
      updateTimerDisplay();
    });
  }

  function setMode(mode, mins) {
    currentMode = mode;
    secondsRemaining = mins * 60;
    if (modeStatus) {
      modeStatus.textContent = mode === 'focus' ? '🎯 Focus Session' : '☕ Rest Break';
      modeStatus.className = `badge ${mode === 'focus' ? 'badge-primary' : 'badge-low'}`;
    }
    updateTimerDisplay();
  }

  // Presets
  document.querySelectorAll('[data-pomo-minutes]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mins = Number(btn.getAttribute('data-pomo-minutes'));
      const mode = btn.getAttribute('data-pomo-mode') || 'focus';
      clearInterval(timerInterval);
      isRunning = false;
      if (pauseBtn) pauseBtn.style.display = 'none';
      if (startBtn) startBtn.style.display = 'inline-flex';
      setMode(mode, mins);
      document.querySelectorAll('[data-pomo-minutes]').forEach(b => b.classList.remove('btn-primary'));
      btn.classList.add('btn-primary');
    });
  });

  updateTimerDisplay();
});
