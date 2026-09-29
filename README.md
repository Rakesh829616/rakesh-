# LifeOS - Personal Productivity & Life Management System

> **Organize your life. Build your future.**

LifeOS is a personal productivity and life-management web application that brings all important areas of daily life into one organized, intuitive system.

---

## 📸 Architecture & Features

### 1. Dashboard
- **Greeting Banner**: Personalized greeting with daily schedule overview and inspirational mountain landscape card (`"Discipline today builds freedom tomorrow."`).
- **5 Summary Metric Cards**: Tasks, Goals, Habits, Study, and Expenses.
- **Today's Tasks**: Priority badges (High, Medium, Low), due times, interactive completion checkboxes.
- **Goals Progress**: Progress bars with sub-milestones (Python, SQL, Django, FastAPI, Interview Prep).
- **Habit Tracker**: Streak counters (🔥), weekly check dots, one-click completion.
- **Study Statistics**: Interactive Chart.js Donut chart with total study time (`12h 45m`) and subject breakdown.
- **Finance Overview**: Monthly income, expenses, and savings with dual-line Chart.js area graph.
- **Pomodoro Focus**: Integrated 25:00 countdown timer, 25/5 and 50/10 presets, play/pause controls.
- **Recent Notes**: Quick access to pinned knowledge notes.
- **Right Rail**: 6 Quick Action buttons, mini September calendar, recent notifications, and streak motivation widget.

### 2. Supported Modules
- **Tasks Management**: Todo, In Progress, Completed filtering, priority tags, search, modal creation.
- **Goals Tracking**: Long-term career & study objectives, progress sliders, milestone breakdown.
- **Habits & Streaks**: 7-day consistency visualization, streak counts, daily check-ins.
- **Study Management**: Subjects, study duration logger, hours calculation.
- **Pomodoro Focus**: Dedicated deep work timer with audio alerts and task associations.
- **Personal Finance**: Income and expense tracking, category breakdown (Food, Travel, Education, Bills).
- **Notes Hub**: Categorized notes, pinned items, markdown support.
- **Calendar & Events**: Event scheduling with priority and time intervals.
- **Analytics**: Productivity score (87/100), habit consistency, study trends.
- **AI Assistant**: Intelligent suggestions powered by FastAPI analytical endpoints.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+), Chart.js
- **Main Backend**: Python, Django 5.1, Django REST Framework, JWT Authentication
- **Specialized Service**: FastAPI (uvicorn ASGI), Pydantic v2
- **Database**: MySQL relational schema (`mysql_schema.sql`)

---

## 🚀 Running the Project

### Frontend
Serve with Vite or any static HTTP server:
```bash
npm run dev
# App will run on http://localhost:3000
```

### Django Backend
```bash
cd django_backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers mysqlclient
python manage.py migrate
python manage.py runserver 8000
```

### FastAPI Specialized Analytics Service
```bash
cd fastapi_backend
pip install fastapi uvicorn pydantic
uvicorn main:app --reload --port 8001
```
