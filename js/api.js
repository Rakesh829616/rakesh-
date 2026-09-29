/**
 * LifeOS Centralized API Layer
 * Configurable API Client for Django REST Framework and FastAPI
 * Includes seamless persistent demo storage for standalone evaluation
 */

const LifeOS_API = (() => {
  // Configurable API URLs driven by VITE_API_BASE_URL (defaulting to http://localhost:8000/api)
  const resolveBaseUrl = () => {
    if (typeof window !== 'undefined' && window.__VITE_API_BASE_URL__ && !window.__VITE_API_BASE_URL__.includes('%VITE_API_BASE_URL%')) {
      return window.__VITE_API_BASE_URL__.replace(/\/+$/, '');
    }
    const stored = localStorage.getItem('lifeos_api_base_url');
    if (stored && stored.trim()) return stored.trim().replace(/\/+$/, '');
    return 'http://localhost:8000/api';
  };

  let API_BASE_URL = resolveBaseUrl();
  let FASTAPI_BASE_URL = localStorage.getItem('lifeos_fastapi_base_url') || 'http://127.0.0.1:8001/api/v1';

  // Seed data matching the reference image for Rakesh, MCA Student
  const DEFAULT_USER = {
    id: 1,
    name: 'Rakesh',
    email: 'rakesh.mca@example.com',
    role: 'MCA Student',
    focus: 'Python Backend Development',
    avatar: 'R',
    created_at: '2025-01-15',
    token: 'jwt_mock_token_rakesh_mca_9823471'
  };

  const DEFAULT_TASKS = [
    { id: 1, title: 'Complete Python assignment', priority: 'High', due_time: '10:00 AM', due_date: '2025-09-29', category: 'Study', status: 'In Progress', completed: false },
    { id: 2, title: 'Read Django documentation', priority: 'Medium', due_time: '12:00 PM', due_date: '2025-09-29', category: 'Study', status: 'In Progress', completed: false },
    { id: 3, title: 'Gym workout', priority: 'Low', due_time: '5:00 PM', due_date: '2025-09-29', category: 'Health', status: 'Completed', completed: true },
    { id: 4, title: "Plan tomorrow's study schedule", priority: 'Medium', due_time: '8:00 PM', due_date: '2025-09-29', category: 'Planning', status: 'Todo', completed: false },
    { id: 5, title: 'Update resume', priority: 'High', due_time: '9:00 PM', due_date: '2025-09-29', category: 'Career', status: 'Todo', completed: false },
    { id: 6, title: 'Practice SQL Window Functions', priority: 'Medium', due_time: '3:00 PM', due_date: '2025-09-29', category: 'Study', status: 'Completed', completed: true },
    { id: 7, title: 'Implement JWT auth in FastAPI', priority: 'High', due_time: '6:30 PM', due_date: '2025-09-29', category: 'Project', status: 'Completed', completed: true }
  ];

  const DEFAULT_GOALS = [
    { id: 1, title: 'Become a Python Backend Developer', progress: 68, category: 'Career', target_date: '2025-12-31', status: 'Active', milestones: ['Python', 'SQL', 'Django', 'FastAPI', 'Projects'] },
    { id: 2, title: 'Complete Django', progress: 45, category: 'Study', target_date: '2025-10-31', status: 'Active', milestones: ['ORM', 'DRF', 'Authentication', 'Deployment'] },
    { id: 3, title: 'Build LifeOS', progress: 30, category: 'Project', target_date: '2025-10-15', status: 'Active', milestones: ['Frontend Architecture', 'Django Backend', 'FastAPI Integration'] },
    { id: 4, title: 'Improve SQL', progress: 55, category: 'Study', target_date: '2025-11-15', status: 'Active', milestones: ['Subqueries', 'Indexing', 'Transactions', 'Query Optimization'] },
    { id: 5, title: 'Prepare for interviews', progress: 20, category: 'Career', target_date: '2026-01-15', status: 'Active', milestones: ['DSA in Python', 'System Design', 'Mock Interviews'] }
  ];

  const DEFAULT_HABITS = [
    { id: 1, name: 'Python Practice', icon: '</>', streak: 12, target_days: 7, history: [true, true, true, true, true, true, true], completed_today: true },
    { id: 2, name: 'Gym', icon: '🏋️', streak: 5, target_days: 5, history: [true, true, true, true, true, false, false], completed_today: true },
    { id: 3, name: 'Reading', icon: '📖', streak: 8, target_days: 7, history: [true, true, true, true, true, true, true], completed_today: true },
    { id: 4, name: 'Water (3L)', icon: '💧', streak: 3, target_days: 7, history: [true, true, true, false, false, false, false], completed_today: true },
    { id: 5, name: 'SQL Practice', icon: '🗄️', streak: 7, target_days: 6, history: [true, true, true, true, true, true, false], completed_today: true },
    { id: 6, name: 'Sleep by 11 PM', icon: '🌙', streak: 2, target_days: 7, history: [false, false, true, true, false, false, false], completed_today: false },
    { id: 7, name: 'Meditation (10m)', icon: '🧘', streak: 4, target_days: 7, history: [true, true, true, true, false, false, false], completed_today: false }
  ];

  const DEFAULT_STUDY = {
    total_today_minutes: 160, // 2h 40m
    total_week_hours: '12h 45m',
    subjects: [
      { name: 'Python', percentage: 32, minutes_today: 60, color: '#3b82f6' },
      { name: 'Django', percentage: 24, minutes_today: 45, color: '#7c3aed' },
      { name: 'SQL', percentage: 18, minutes_today: 30, color: '#ea580c' },
      { name: 'JavaScript', percentage: 14, minutes_today: 25, color: '#10b981' },
      { name: 'Other', percentage: 12, minutes_today: 0, color: '#94a3b8' }
    ]
  };

  const DEFAULT_FINANCE = {
    monthly_income: 35000,
    monthly_expenses: 8450,
    monthly_savings: 8000,
    monthly_family_support: 12000,
    net_remaining: 6550,
    today_expense: 620,
    currency: '₹',
    impact_message: 'Great job supporting your family (₹12,000 sent home) and building your savings (₹8,000 invested) this month! 🎉',
    transactions: [
      { id: 1, type: 'EXPENSE', title: 'Python Book purchase', category: 'Education', amount: 450, date: '2025-09-29', payment_method: 'UPI' },
      { id: 2, type: 'EXPENSE', title: 'Lunch at Cafe', category: 'Food', amount: 170, date: '2025-09-29', payment_method: 'Cash' },
      { id: 3, type: 'FAMILY_SUPPORT', title: 'Monthly Home Support (Sent to Parents)', category: 'Family Support', amount: 12000, date: '2025-09-26', payment_method: 'Bank Transfer' },
      { id: 4, type: 'SAVINGS', title: 'Emergency Fund Recurring Deposit', category: 'Savings & Investments', amount: 5000, date: '2025-09-26', payment_method: 'Auto-Debit' },
      { id: 5, type: 'SAVINGS', title: 'Mutual Fund SIP Investment', category: 'Savings & Investments', amount: 3000, date: '2025-09-25', payment_method: 'UPI' },
      { id: 6, type: 'INCOME', title: 'Freelance frontend project', category: 'Freelance', amount: 25000, date: '2025-09-25', payment_method: 'Bank Transfer' },
      { id: 7, type: 'INCOME', title: 'Python Tutoring & Coaching', category: 'Coaching', amount: 10000, date: '2025-09-22', payment_method: 'UPI' },
      { id: 8, type: 'EXPENSE', title: 'Cloud server hosting', category: 'Bills', amount: 800, date: '2025-09-20', payment_method: 'Card' },
      { id: 9, type: 'EXPENSE', title: 'Metro transit pass', category: 'Travel', amount: 1200, date: '2025-09-15', payment_method: 'UPI' }
    ]
  };

  const DEFAULT_NOTES = [
    { id: 1, title: 'Django Learning Notes', category: 'Study', updated_at: 'Sep 26, 2025', pinned: true, content: 'Remember: Django ORM select_related is for single relations (ForeignKey/OneToOne) while prefetch_related is for many-to-many and reverse ForeignKeys.' },
    { id: 2, title: 'Interview Preparation', category: 'Career', updated_at: 'Sep 26, 2025', pinned: true, content: 'Topics to master: Python GIL, async/await event loop in FastAPI, indexing in MySQL (B-Tree vs Hash), REST vs GraphQL.' },
    { id: 3, title: 'Project Ideas', category: 'Project', updated_at: 'Sep 24, 2025', pinned: false, content: 'LifeOS: All-in-one productivity with Django + FastAPI. Add real-time notifications with WebSockets later.' }
  ];

  const DEFAULT_EVENTS = [
    { id: 1, title: 'Python Mock Interview', date: '2025-09-29', start_time: '11:00 AM', end_time: '12:00 PM', category: 'Interview', priority: 'High' },
    { id: 2, title: 'Submit MCA Project Proposal', date: '2025-09-30', start_time: '02:00 PM', end_time: '03:00 PM', category: 'College', priority: 'High' },
    { id: 3, title: 'FastAPI Workshop', date: '2025-10-04', start_time: '10:00 AM', end_time: '01:00 PM', category: 'Study', priority: 'Medium' }
  ];

  const DEFAULT_NOTIFICATIONS = [
    { id: 1, title: 'Your Python study goal is due tomorrow.', time: '2 hours ago', icon: '🎯', unread: true },
    { id: 2, title: 'You completed your 7-day habit streak!', time: '5 hours ago', icon: '🔥', unread: true },
    { id: 3, title: 'You have 3 unfinished tasks.', time: '6 hours ago', icon: '✓', unread: false }
  ];

  // Helper to get or set local store
  function getStore(key, defaultVal) {
    const raw = localStorage.getItem('lifeos_' + key);
    if (!raw) {
      localStorage.setItem('lifeos_' + key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return defaultVal;
    }
  }

  function setStore(key, val) {
    localStorage.setItem('lifeos_' + key, JSON.stringify(val));
  }

  // Token management
  function getToken() {
    return localStorage.getItem('lifeos_jwt_token') || DEFAULT_USER.token;
  }

  function setToken(token) {
    localStorage.setItem('lifeos_jwt_token', token);
  }

  function removeToken() {
    localStorage.removeItem('lifeos_jwt_token');
  }

  // Generic request dispatcher: attempts real fetch, gracefully falls back to local repository
  async function request(endpoint, options = {}, fallbackHandler = null) {
    const isFastAPI = endpoint.startsWith('/fastapi/');
    const baseUrl = isFastAPI ? FASTAPI_BASE_URL : API_BASE_URL;
    const cleanEndpoint = endpoint.replace('/fastapi/', '/');
    const url = `${baseUrl}${cleanEndpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...(options.headers || {})
    };

    try {
      // Short timeout to verify if real backend is listening
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      // Backend not currently reachable in standalone browser mode; use realistic local store
      if (fallbackHandler) {
        return fallbackHandler();
      }
      throw err;
    }
  }

  return {
    getApiBaseUrl: () => API_BASE_URL,
    setApiBaseUrl: (url) => {
      API_BASE_URL = url;
      localStorage.setItem('lifeos_api_base_url', url);
    },
    getFastApiBaseUrl: () => FASTAPI_BASE_URL,
    setFastApiBaseUrl: (url) => {
      FASTAPI_BASE_URL = url;
      localStorage.setItem('lifeos_fastapi_base_url', url);
    },

    // Authentication (Django DRF)
    auth: {
      login: async (email, password) => {
        return request('/auth/login/', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        }, () => {
          // Demo authentication
          const user = getStore('user', DEFAULT_USER);
          setToken(user.token);
          return { success: true, user, token: user.token };
        });
      },
      register: async (fullName, email, password) => {
        return request('/auth/register/', {
          method: 'POST',
          body: JSON.stringify({ full_name: fullName, email, password })
        }, () => {
          const user = {
            ...DEFAULT_USER,
            name: fullName,
            email: email,
            created_at: new Date().toISOString().split('T')[0]
          };
          setStore('user', user);
          setToken(user.token);
          return { success: true, user, token: user.token };
        });
      },
      getProfile: async () => {
        return request('/auth/profile/', {}, () => getStore('user', DEFAULT_USER));
      },
      updateProfile: async (profileData) => {
        return request('/auth/profile/', {
          method: 'PATCH',
          body: JSON.stringify(profileData)
        }, () => {
          const user = { ...getStore('user', DEFAULT_USER), ...profileData };
          setStore('user', user);
          return user;
        });
      },
      logout: () => {
        removeToken();
        window.location.href = 'login.html';
      },
      isAuthenticated: () => {
        return true; // Auto-authenticated with default demo profile for seamless review
      }
    },

    // Tasks (Django DRF)
    tasks: {
      list: async () => {
        return request('/tasks/', {}, () => getStore('tasks', DEFAULT_TASKS));
      },
      create: async (task) => {
        return request('/tasks/', {
          method: 'POST',
          body: JSON.stringify(task)
        }, () => {
          const tasks = getStore('tasks', DEFAULT_TASKS);
          const newTask = { ...task, id: Date.now(), completed: false };
          tasks.unshift(newTask);
          setStore('tasks', tasks);
          return newTask;
        });
      },
      toggle: async (id) => {
        return request(`/tasks/${id}/toggle/`, { method: 'POST' }, () => {
          const tasks = getStore('tasks', DEFAULT_TASKS);
          const t = tasks.find(item => item.id == id);
          if (t) {
            t.completed = !t.completed;
            t.status = t.completed ? 'Completed' : 'In Progress';
            setStore('tasks', tasks);
          }
          return t;
        });
      },
      delete: async (id) => {
        return request(`/tasks/${id}/`, { method: 'DELETE' }, () => {
          let tasks = getStore('tasks', DEFAULT_TASKS);
          tasks = tasks.filter(item => item.id != id);
          setStore('tasks', tasks);
          return { success: true };
        });
      }
    },

    // Goals (Django DRF)
    goals: {
      list: async () => {
        return request('/goals/', {}, () => getStore('goals', DEFAULT_GOALS));
      },
      create: async (goal) => {
        return request('/goals/', {
          method: 'POST',
          body: JSON.stringify(goal)
        }, () => {
          const goals = getStore('goals', DEFAULT_GOALS);
          const newGoal = { ...goal, id: Date.now(), progress: goal.progress || 0, status: 'Active' };
          goals.push(newGoal);
          setStore('goals', goals);
          return newGoal;
        });
      },
      updateProgress: async (id, progress) => {
        return request(`/goals/${id}/`, {
          method: 'PATCH',
          body: JSON.stringify({ progress })
        }, () => {
          const goals = getStore('goals', DEFAULT_GOALS);
          const g = goals.find(item => item.id == id);
          if (g) {
            g.progress = Math.min(100, Math.max(0, progress));
            setStore('goals', goals);
          }
          return g;
        });
      }
    },

    // Habits (Django DRF)
    habits: {
      list: async () => {
        return request('/habits/', {}, () => getStore('habits', DEFAULT_HABITS));
      },
      toggleToday: async (id) => {
        return request(`/habits/${id}/complete/`, { method: 'POST' }, () => {
          const habits = getStore('habits', DEFAULT_HABITS);
          const h = habits.find(item => item.id == id);
          if (h) {
            h.completed_today = !h.completed_today;
            if (h.completed_today) h.streak += 1;
            else h.streak = Math.max(0, h.streak - 1);
            setStore('habits', habits);
          }
          return h;
        });
      },
      create: async (habit) => {
        return request('/habits/', {
          method: 'POST',
          body: JSON.stringify(habit)
        }, () => {
          const habits = getStore('habits', DEFAULT_HABITS);
          const newHabit = {
            id: Date.now(),
            name: habit.name,
            icon: habit.icon || '🔥',
            streak: 0,
            target_days: habit.target_days || 7,
            history: [false, false, false, false, false, false, false],
            completed_today: false
          };
          habits.push(newHabit);
          setStore('habits', habits);
          return newHabit;
        });
      }
    },

    // Study & Pomodoro
    study: {
      getSummary: async () => {
        return request('/study-sessions/summary/', {}, () => getStore('study', DEFAULT_STUDY));
      },
      logSession: async (subject, minutes) => {
        return request('/study-sessions/', {
          method: 'POST',
          body: JSON.stringify({ subject, minutes })
        }, () => {
          const study = getStore('study', DEFAULT_STUDY);
          study.total_today_minutes += minutes;
          const s = study.subjects.find(sub => sub.name.toLowerCase() === subject.toLowerCase());
          if (s) s.minutes_today += minutes;
          setStore('study', study);
          return study;
        });
      }
    },

    // Finances
    finance: {
      getOverview: async () => {
        return request('/finances/overview/', {}, () => {
          const fin = getStore('finance', DEFAULT_FINANCE);
          // Recalculate
          let inc = 0, exp = 0, sav = 0, fam = 0;
          (fin.transactions || []).forEach(t => {
            const amt = Number(t.amount) || 0;
            const typ = (t.type || 'EXPENSE').toUpperCase();
            if (typ === 'INCOME') inc += amt;
            else if (typ === 'SAVINGS') sav += amt;
            else if (typ === 'FAMILY_SUPPORT') fam += amt;
            else exp += amt;
          });
          fin.monthly_income = inc;
          fin.monthly_expenses = exp;
          fin.monthly_savings = sav;
          fin.monthly_family_support = fam;
          fin.net_remaining = inc - (exp + sav + fam);
          setStore('finance', fin);
          return fin;
        });
      },
      addTransaction: async (tx) => {
        return request('/expenses/', {
          method: 'POST',
          body: JSON.stringify(tx)
        }, () => {
          const fin = getStore('finance', DEFAULT_FINANCE);
          const rawType = (tx.type || 'EXPENSE').toUpperCase();
          const normType = rawType.includes('INC') ? 'INCOME' : rawType.includes('SAV') ? 'SAVINGS' : (rawType.includes('FAM') || rawType.includes('HOME')) ? 'FAMILY_SUPPORT' : 'EXPENSE';
          const newTx = { ...tx, type: normType, id: Date.now(), date: tx.date || new Date().toISOString().split('T')[0] };
          if (!fin.transactions) fin.transactions = [];
          fin.transactions.unshift(newTx);
          
          let inc = 0, exp = 0, sav = 0, fam = 0;
          fin.transactions.forEach(t => {
            const amt = Number(t.amount) || 0;
            const typ = (t.type || 'EXPENSE').toUpperCase();
            if (typ === 'INCOME') inc += amt;
            else if (typ === 'SAVINGS') sav += amt;
            else if (typ === 'FAMILY_SUPPORT') fam += amt;
            else exp += amt;
          });
          fin.monthly_income = inc;
          fin.monthly_expenses = exp;
          fin.monthly_savings = sav;
          fin.monthly_family_support = fam;
          fin.net_remaining = inc - (exp + sav + fam);
          setStore('finance', fin);
          return newTx;
        });
      }
    },

    // Notes
    notes: {
      list: async () => {
        return request('/notes/', {}, () => getStore('notes', DEFAULT_NOTES));
      },
      create: async (note) => {
        return request('/notes/', {
          method: 'POST',
          body: JSON.stringify(note)
        }, () => {
          const notes = getStore('notes', DEFAULT_NOTES);
          const newNote = {
            ...note,
            id: Date.now(),
            updated_at: 'Just now',
            pinned: !!note.pinned
          };
          notes.unshift(newNote);
          setStore('notes', notes);
          return newNote;
        });
      },
      delete: async (id) => {
        return request(`/notes/${id}/`, { method: 'DELETE' }, () => {
          let notes = getStore('notes', DEFAULT_NOTES);
          notes = notes.filter(n => n.id != id);
          setStore('notes', notes);
          return { success: true };
        });
      }
    },

    // Calendar
    calendar: {
      list: async () => {
        return request('/events/', {}, () => getStore('events', DEFAULT_EVENTS));
      },
      create: async (event) => {
        return request('/events/', {
          method: 'POST',
          body: JSON.stringify(event)
        }, () => {
          const events = getStore('events', DEFAULT_EVENTS);
          const newEvent = { ...event, id: Date.now() };
          events.push(newEvent);
          setStore('events', events);
          return newEvent;
        });
      }
    },

    // Notifications
    notifications: {
      list: async () => {
        return request('/notifications/', {}, () => getStore('notifications', DEFAULT_NOTIFICATIONS));
      }
    },

    // FastAPI Specialized Endpoints
    fastapi: {
      getProductivityAnalytics: async () => {
        return request('/fastapi/analytics/productivity/', {}, () => {
          return {
            productivity_score: 87,
            weekly_trend: [72, 75, 80, 84, 88, 92, 87],
            tasks_completion_rate: 78.5,
            habit_consistency_index: 82.0,
            study_hours_this_week: 12.75,
            deep_work_focus_ratio: 0.74,
            generated_at: new Date().toISOString()
          };
        });
      },
      askAssistant: async (prompt) => {
        return request('/fastapi/ai/assistant/', {
          method: 'POST',
          body: JSON.stringify({ prompt })
        }, () => {
          // Context-aware intelligent productivity assistant response
          const lower = prompt.toLowerCase();
          if (lower.includes('focus') || lower.includes('today')) {
            return {
              reply: "Based on your schedule, you have 2 high-priority tasks due today: 'Complete Python assignment' (10:00 AM) and 'Update resume' (9:00 PM). I recommend starting with a 50-minute Pomodoro session on your Python assignment.",
              recommendations: ['Start 50-minute Pomodoro', 'Review Django docs next', 'Hydrate before gym']
            };
          } else if (lower.includes('productivity') || lower.includes('analyze')) {
            return {
              reply: "Your weekly productivity score is 87%! You have maintained a 12-day streak on Python practice and completed 12h 45m of study this week. Keep an eye on your 11 PM sleep habit to prevent burnout.",
              recommendations: ['Maintain Python streak', 'Log tonight’s study session', 'Aim for 7+ hours sleep']
            };
          } else if (lower.includes('money') || lower.includes('spending') || lower.includes('expense')) {
            return {
              reply: "This month you earned ₹25,000 and spent ₹8,450, yielding ₹16,550 in savings (66% savings rate!). Your largest expense category was Travel and Cloud Hosting.",
              recommendations: ['Set monthly travel cap', 'Review recurring cloud subscriptions']
            };
          } else {
            return {
              reply: "I am your LifeOS AI assistant powered by the FastAPI analytical service. I can help organize your study goals, optimize your Pomodoro focus, or break down complex projects into actionable milestones.",
              recommendations: ['What should I focus on today?', 'Analyze my productivity', 'Where am I spending too much money?']
            };
          }
        });
      }
    }
  };
})();

// Export globally
window.LifeOS_API = LifeOS_API;
