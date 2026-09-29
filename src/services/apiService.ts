import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Interface Definitions for LifeOS Resources
 */
export interface Task {
  id: number;
  title: string;
  category?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Todo' | 'In Progress' | 'Completed';
  completed: boolean;
  due_date?: string;
  due_time?: string;
  created_at?: string;
}

export interface Goal {
  id: number;
  title: string;
  category?: string;
  progress: number;
  target_date?: string;
  status: 'Active' | 'Completed' | 'Paused';
  milestones?: string[];
  created_at?: string;
}

export interface Habit {
  id: number;
  name: string;
  icon?: string;
  streak: number;
  target_days: number;
  history: boolean[];
  completed_today: boolean;
  created_at?: string;
}

export type FinanceTransactionType = 'INCOME' | 'EXPENSE' | 'SAVINGS' | 'FAMILY_SUPPORT' | 'income' | 'expense' | 'savings' | 'family_support';

export interface Expense {
  id: number;
  user_id?: number;
  title: string;
  amount: number;
  category: string;
  type: FinanceTransactionType;
  payment_method?: string;
  date: string;
  notes?: string;
}

export interface FinanceOverview {
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  monthly_family_support: number;
  net_remaining: number;
  today_expense: number;
  currency: string;
  transactions: Expense[];
  impact_message?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role?: string;
  focus?: string;
  avatar?: string;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
  message?: string;
}

/**
 * Base URL resolution:
 * Uses Vite environment variable VITE_API_BASE_URL (defaulting to http://localhost:8000/api)
 */
const getBaseUrl = (): string => {
  // Vite env variable
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Window global injected by index.html or local storage override
  if (typeof window !== 'undefined') {
    const globalBase = (window as unknown as { __VITE_API_BASE_URL__?: string }).__VITE_API_BASE_URL__;
    if (globalBase && !globalBase.includes('%VITE_API_BASE_URL%')) {
      return globalBase;
    }
    const stored = localStorage.getItem('lifeos_api_base_url');
    if (stored) return stored;
  }
  return 'http://localhost:8000/api';
};

export const API_BASE_URL = getBaseUrl();

/**
 * Token Management Helper
 */
const TOKEN_KEY = 'lifeos_jwt_token';

export const tokenStorage = {
  get: (): string | null => {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set: (token: string): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  remove: (): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
};

/**
 * Axios Client Instance configured with Authentication Headers
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1500,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Seed data constants for guaranteed offline local state fallback
const DEFAULT_TASKS: Task[] = [
  { id: 1, title: 'Complete Python assignment', priority: 'High', due_time: '10:00 AM', due_date: '2025-09-29', category: 'Study', status: 'In Progress', completed: false },
  { id: 2, title: 'Read Django documentation', priority: 'Medium', due_time: '12:00 PM', due_date: '2025-09-29', category: 'Study', status: 'In Progress', completed: false },
  { id: 3, title: 'Gym workout', priority: 'Low', due_time: '5:00 PM', due_date: '2025-09-29', category: 'Health', status: 'Completed', completed: true },
  { id: 4, title: "Plan tomorrow's study schedule", priority: 'Medium', due_time: '8:00 PM', due_date: '2025-09-29', category: 'Planning', status: 'Todo', completed: false },
  { id: 5, title: 'Update resume', priority: 'High', due_time: '9:00 PM', due_date: '2025-09-29', category: 'Career', status: 'Todo', completed: false },
  { id: 6, title: 'Practice SQL Window Functions', priority: 'Medium', due_time: '3:00 PM', due_date: '2025-09-29', category: 'Study', status: 'Completed', completed: true },
  { id: 7, title: 'Implement JWT auth in FastAPI', priority: 'High', due_time: '6:30 PM', due_date: '2025-09-29', category: 'Project', status: 'Completed', completed: true }
];

const DEFAULT_GOALS: Goal[] = [
  { id: 1, title: 'Become a Python Backend Developer', progress: 68, category: 'Career', target_date: '2025-12-31', status: 'Active', milestones: ['Python', 'SQL', 'Django', 'FastAPI', 'Projects'] },
  { id: 2, title: 'Complete Django', progress: 45, category: 'Study', target_date: '2025-10-31', status: 'Active', milestones: ['ORM', 'DRF', 'Authentication', 'Deployment'] },
  { id: 3, title: 'Build LifeOS', progress: 30, category: 'Project', target_date: '2025-10-15', status: 'Active', milestones: ['Frontend Architecture', 'Django Backend', 'FastAPI Integration'] },
  { id: 4, title: 'Improve SQL', progress: 55, category: 'Study', target_date: '2025-11-15', status: 'Active', milestones: ['Subqueries', 'Indexing', 'Transactions', 'Query Optimization'] },
  { id: 5, title: 'Prepare for interviews', progress: 20, category: 'Career', target_date: '2026-01-15', status: 'Active', milestones: ['DSA in Python', 'System Design', 'Mock Interviews'] }
];

const DEFAULT_HABITS: Habit[] = [
  { id: 1, name: 'Python Practice', icon: '</>', streak: 12, target_days: 7, history: [true, true, true, true, true, true, true], completed_today: true },
  { id: 2, name: 'Gym', icon: '🏋️', streak: 5, target_days: 5, history: [true, true, true, true, true, false, false], completed_today: true },
  { id: 3, name: 'Reading', icon: '📖', streak: 8, target_days: 7, history: [true, true, true, true, true, true, true], completed_today: true },
  { id: 4, name: 'Water (3L)', icon: '💧', streak: 3, target_days: 7, history: [true, true, true, false, false, false, false], completed_today: true },
  { id: 5, name: 'SQL Practice', icon: '🗄️', streak: 7, target_days: 6, history: [true, true, true, true, true, true, false], completed_today: true },
  { id: 6, name: 'Sleep by 11 PM', icon: '🌙', streak: 2, target_days: 7, history: [false, false, true, true, false, false, false], completed_today: false },
  { id: 7, name: 'Meditation (10m)', icon: '🧘', streak: 4, target_days: 7, history: [true, true, true, true, false, false, false], completed_today: false }
];

const DEFAULT_FINANCE: FinanceOverview = {
  monthly_income: 25000,
  monthly_expenses: 8450,
  monthly_savings: 16550,
  today_expense: 620,
  currency: '₹',
  transactions: [
    { id: 1, type: 'expense', title: 'Python Book purchase', category: 'Education', amount: 450, date: '2025-09-29', payment_method: 'UPI' },
    { id: 2, type: 'expense', title: 'Lunch at Cafe', category: 'Food', amount: 170, date: '2025-09-29', payment_method: 'Cash' },
    { id: 3, type: 'income', title: 'Freelance frontend project', category: 'Freelance', amount: 25000, date: '2025-09-25', payment_method: 'Bank Transfer' },
    { id: 4, type: 'expense', title: 'Cloud server hosting', category: 'Bills', amount: 800, date: '2025-09-20', payment_method: 'Card' },
    { id: 5, type: 'expense', title: 'Metro transit pass', category: 'Travel', amount: 1200, date: '2025-09-15', payment_method: 'UPI' }
  ]
};

function getLocal<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem('lifeos_' + key);
    if (!raw) {
      localStorage.setItem('lifeos_' + key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
      localStorage.setItem('lifeos_' + key, JSON.stringify(fallback));
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

// Request Interceptor: Attach Bearer JWT authentication header
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Graceful handling of common HTTP responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('API returned 401 Unauthorized. Session may have expired.');
    }
    return Promise.reject(error);
  }
);

/**
 * Generic request helper that works with external backend
 * and provides structured fallbacks if offline.
 */
async function apiRequest<T>(
  requestFn: () => Promise<AxiosResponse<T> | T>,
  fallbackFn?: () => T | Promise<T>
): Promise<T> {
  try {
    const res = await requestFn();
    if (res && typeof res === 'object' && 'data' in res) {
      return (res as AxiosResponse<T>).data;
    }
    return res as T;
  } catch (err: unknown) {
    if (fallbackFn) {
      console.info('External backend unreachable, utilizing local cached data:', err);
      return await fallbackFn();
    }
    throw err;
  }
}

/**
 * Standard Tasks CRUD Service
 */
export const taskService = {
  getAll: async (params?: { category?: string; status?: string; search?: string }): Promise<Task[]> => {
    return apiRequest<Task[]>(
      () => apiClient.get('/tasks/', { params }),
      () => getLocal<Task[]>('tasks', DEFAULT_TASKS)
    );
  },

  getById: async (id: number | string): Promise<Task> => {
    return apiRequest<Task>(
      () => apiClient.get(`/tasks/${id}/`),
      () => {
        const tasks = getLocal<Task[]>('tasks', DEFAULT_TASKS);
        const found = tasks.find(t => String(t.id) === String(id));
        if (!found) throw new Error(`Task ${id} not found`);
        return found;
      }
    );
  },

  create: async (data: Omit<Task, 'id'> | Partial<Task>): Promise<Task> => {
    return apiRequest<Task>(
      () => apiClient.post('/tasks/', data),
      () => {
        const tasks = getLocal<Task[]>('tasks', DEFAULT_TASKS);
        const newTask: Task = {
          id: Date.now(),
          title: data.title || 'Untitled Task',
          priority: data.priority || 'Medium',
          status: data.status || 'Todo',
          completed: !!data.completed,
          category: data.category || 'General',
          due_date: data.due_date,
          due_time: data.due_time,
          created_at: new Date().toISOString()
        };
        tasks.unshift(newTask);
        localStorage.setItem('lifeos_tasks', JSON.stringify(tasks));
        return newTask;
      }
    );
  },

  update: async (id: number | string, data: Partial<Task>): Promise<Task> => {
    return apiRequest<Task>(
      () => apiClient.patch(`/tasks/${id}/`, data),
      () => {
        const tasks = getLocal<Task[]>('tasks', DEFAULT_TASKS);
        const index = tasks.findIndex(t => String(t.id) === String(id));
        if (index === -1) throw new Error(`Task ${id} not found`);
        tasks[index] = { ...tasks[index], ...data };
        localStorage.setItem('lifeos_tasks', JSON.stringify(tasks));
        return tasks[index];
      }
    );
  },

  toggle: async (id: number | string): Promise<Task> => {
    return apiRequest<Task>(
      () => apiClient.post(`/tasks/${id}/toggle/`),
      async () => {
        const current = await taskService.getById(id);
        const updatedStatus = !current.completed;
        return taskService.update(id, {
          completed: updatedStatus,
          status: updatedStatus ? 'Completed' : 'In Progress'
        });
      }
    );
  },

  delete: async (id: number | string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(
      () => apiClient.delete(`/tasks/${id}/`).then(() => ({ success: true })),
      () => {
        let tasks = getLocal<Task[]>('tasks', DEFAULT_TASKS);
        tasks = tasks.filter(t => String(t.id) !== String(id));
        localStorage.setItem('lifeos_tasks', JSON.stringify(tasks));
        return { success: true };
      }
    );
  }
};

/**
 * Standard Goals CRUD Service
 */
export const goalService = {
  getAll: async (): Promise<Goal[]> => {
    return apiRequest<Goal[]>(
      () => apiClient.get('/goals/'),
      () => getLocal<Goal[]>('goals', DEFAULT_GOALS)
    );
  },

  getById: async (id: number | string): Promise<Goal> => {
    return apiRequest<Goal>(
      () => apiClient.get(`/goals/${id}/`),
      () => {
        const goals = getLocal<Goal[]>('goals', DEFAULT_GOALS);
        const found = goals.find(g => String(g.id) === String(id));
        if (!found) throw new Error(`Goal ${id} not found`);
        return found;
      }
    );
  },

  create: async (data: Partial<Goal>): Promise<Goal> => {
    return apiRequest<Goal>(
      () => apiClient.post('/goals/', data),
      () => {
        const goals = getLocal<Goal[]>('goals', DEFAULT_GOALS);
        const newGoal: Goal = {
          id: Date.now(),
          title: data.title || 'Untitled Goal',
          category: data.category || 'General',
          progress: data.progress || 0,
          target_date: data.target_date || new Date().toISOString().split('T')[0],
          status: data.status || 'Active',
          milestones: data.milestones || ['Planning', 'In Progress', 'Completed']
        };
        goals.push(newGoal);
        localStorage.setItem('lifeos_goals', JSON.stringify(goals));
        return newGoal;
      }
    );
  },

  update: async (id: number | string, data: Partial<Goal>): Promise<Goal> => {
    return apiRequest<Goal>(
      () => apiClient.patch(`/goals/${id}/`, data),
      () => {
        const goals = getLocal<Goal[]>('goals', DEFAULT_GOALS);
        const index = goals.findIndex(g => String(g.id) === String(id));
        if (index === -1) throw new Error(`Goal ${id} not found`);
        goals[index] = { ...goals[index], ...data };
        localStorage.setItem('lifeos_goals', JSON.stringify(goals));
        return goals[index];
      }
    );
  },

  updateProgress: async (id: number | string, progress: number): Promise<Goal> => {
    const clamped = Math.max(0, Math.min(100, progress));
    return goalService.update(id, {
      progress: clamped,
      status: clamped >= 100 ? 'Completed' : 'Active'
    });
  },

  delete: async (id: number | string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(
      () => apiClient.delete(`/goals/${id}/`).then(() => ({ success: true })),
      () => {
        let goals = getLocal<Goal[]>('goals', DEFAULT_GOALS);
        goals = goals.filter(g => String(g.id) !== String(id));
        localStorage.setItem('lifeos_goals', JSON.stringify(goals));
        return { success: true };
      }
    );
  }
};

/**
 * Standard Habits CRUD Service
 */
export const habitService = {
  getAll: async (): Promise<Habit[]> => {
    return apiRequest<Habit[]>(
      () => apiClient.get('/habits/'),
      () => getLocal<Habit[]>('habits', DEFAULT_HABITS)
    );
  },

  getById: async (id: number | string): Promise<Habit> => {
    return apiRequest<Habit>(
      () => apiClient.get(`/habits/${id}/`),
      () => {
        const habits = getLocal<Habit[]>('habits', DEFAULT_HABITS);
        const found = habits.find(h => String(h.id) === String(id));
        if (!found) throw new Error(`Habit ${id} not found`);
        return found;
      }
    );
  },

  create: async (data: Partial<Habit>): Promise<Habit> => {
    return apiRequest<Habit>(
      () => apiClient.post('/habits/', data),
      () => {
        const habits = getLocal<Habit[]>('habits', DEFAULT_HABITS);
        const newHabit: Habit = {
          id: Date.now(),
          name: data.name || 'New Habit',
          icon: data.icon || '🔥',
          streak: 0,
          target_days: data.target_days || 7,
          history: [false, false, false, false, false, false, false],
          completed_today: false
        };
        habits.push(newHabit);
        localStorage.setItem('lifeos_habits', JSON.stringify(habits));
        return newHabit;
      }
    );
  },

  update: async (id: number | string, data: Partial<Habit>): Promise<Habit> => {
    return apiRequest<Habit>(
      () => apiClient.patch(`/habits/${id}/`, data),
      () => {
        const habits = getLocal<Habit[]>('habits', DEFAULT_HABITS);
        const index = habits.findIndex(h => String(h.id) === String(id));
        if (index === -1) throw new Error(`Habit ${id} not found`);
        habits[index] = { ...habits[index], ...data };
        localStorage.setItem('lifeos_habits', JSON.stringify(habits));
        return habits[index];
      }
    );
  },

  complete: async (id: number | string): Promise<Habit> => {
    return apiRequest<Habit>(
      () => apiClient.post(`/habits/${id}/complete/`),
      async () => {
        const current = await habitService.getById(id);
        const willBeCompleted = !current.completed_today;
        const newStreak = willBeCompleted ? current.streak + 1 : Math.max(0, current.streak - 1);
        const newHistory = [...current.history];
        newHistory[newHistory.length - 1] = willBeCompleted;
        return habitService.update(id, {
          completed_today: willBeCompleted,
          streak: newStreak,
          history: newHistory
        });
      }
    );
  },

  delete: async (id: number | string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(
      () => apiClient.delete(`/habits/${id}/`).then(() => ({ success: true })),
      () => {
        let habits = getLocal<Habit[]>('habits', DEFAULT_HABITS);
        habits = habits.filter(h => String(h.id) !== String(id));
        localStorage.setItem('lifeos_habits', JSON.stringify(habits));
        return { success: true };
      }
    );
  }
};

/**
 * Standard Expenses & Finance CRUD Service
 */
export const expenseService = {
  getAll: async (params?: { type?: 'expense' | 'income'; category?: string }): Promise<Expense[]> => {
    return apiRequest<Expense[]>(
      () => apiClient.get('/expenses/', { params }),
      () => {
        const parsed = getLocal<FinanceOverview>('finance', DEFAULT_FINANCE);
        let list: Expense[] = parsed.transactions || [];
        if (params?.type) list = list.filter(t => t.type === params.type);
        if (params?.category) list = list.filter(t => t.category === params.category);
        return list;
      }
    );
  },

  getById: async (id: number | string): Promise<Expense> => {
    return apiRequest<Expense>(
      () => apiClient.get(`/expenses/${id}/`),
      () => {
        const parsed = getLocal<FinanceOverview>('finance', DEFAULT_FINANCE);
        const found = (parsed.transactions as Expense[]).find(e => String(e.id) === String(id));
        if (!found) throw new Error(`Expense ${id} not found`);
        return found;
      }
    );
  },

  create: async (data: Partial<Expense>): Promise<Expense> => {
    return apiRequest<Expense>(
      () => apiClient.post('/expenses/', data),
      () => {
        const fin = getLocal<FinanceOverview>('finance', DEFAULT_FINANCE);
        const newExpense: Expense = {
          id: Date.now(),
          title: data.title || 'Untitled Transaction',
          amount: Number(data.amount) || 0,
          category: data.category || 'General',
          type: data.type || 'expense',
          payment_method: data.payment_method || 'UPI',
          date: data.date || new Date().toISOString().split('T')[0],
          notes: data.notes
        };
        fin.transactions.unshift(newExpense);
        if (newExpense.type === 'expense') {
          fin.monthly_expenses += newExpense.amount;
          fin.today_expense += newExpense.amount;
        } else {
          fin.monthly_income += newExpense.amount;
        }
        fin.monthly_savings = fin.monthly_income - fin.monthly_expenses;
        localStorage.setItem('lifeos_finance', JSON.stringify(fin));
        return newExpense;
      }
    );
  },

  update: async (id: number | string, data: Partial<Expense>): Promise<Expense> => {
    return apiRequest<Expense>(
      () => apiClient.patch(`/expenses/${id}/`, data),
      () => {
        const fin = getLocal<FinanceOverview>('finance', DEFAULT_FINANCE);
        const index = fin.transactions.findIndex((t: Expense) => String(t.id) === String(id));
        if (index === -1) throw new Error(`Expense ${id} not found`);
        fin.transactions[index] = { ...fin.transactions[index], ...data };
        localStorage.setItem('lifeos_finance', JSON.stringify(fin));
        return fin.transactions[index];
      }
    );
  },

  delete: async (id: number | string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(
      () => apiClient.delete(`/expenses/${id}/`).then(() => ({ success: true })),
      () => {
        const fin = getLocal<FinanceOverview>('finance', DEFAULT_FINANCE);
        fin.transactions = fin.transactions.filter((t: Expense) => String(t.id) !== String(id));
        localStorage.setItem('lifeos_finance', JSON.stringify(fin));
        return { success: true };
      }
    );
  },

  getOverview: async (): Promise<FinanceOverview> => {
    return apiRequest<FinanceOverview>(
      () => apiClient.get('/finance/overview/'),
      () => getLocal<FinanceOverview>('finance', DEFAULT_FINANCE)
    );
  }
};

/**
 * Authentication Service (Django REST Framework / JWT)
 */
export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login/', { email, password });
    if (res.data.token) {
      tokenStorage.set(res.data.token);
    }
    return res.data;
  },

  register: async (fullName: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register/', {
      full_name: fullName,
      email,
      password
    });
    if (res.data.token) {
      tokenStorage.set(res.data.token);
    }
    return res.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    return apiRequest<UserProfile>(
      () => apiClient.get('/auth/profile/'),
      () => ({
        id: 1,
        name: 'Rakesh',
        email: 'rakesh.mca@example.com',
        role: 'MCA Student',
        focus: 'Python Backend Development',
        avatar: 'R',
        created_at: '2025-01-15'
      })
    );
  },

  logout: (): void => {
    tokenStorage.remove();
  },

  getToken: (): string | null => tokenStorage.get(),
  setToken: (token: string): void => tokenStorage.set(token),
  isAuthenticated: (): boolean => !!tokenStorage.get()
};

/**
 * Master Unified Service Module
 */
export const apiService = {
  tasks: taskService,
  goals: goalService,
  habits: habitService,
  expenses: expenseService,
  auth: authService,
  getBaseUrl,
  client: apiClient
};

export default apiService;
