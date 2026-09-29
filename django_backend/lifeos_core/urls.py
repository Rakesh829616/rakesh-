"""
LifeOS Main URL Routing Configuration (Django REST Framework)
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API v1 Endpoints
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/tasks/', include('apps.tasks.urls')),
    path('api/v1/goals/', include('apps.goals.urls')),
    path('api/v1/habits/', include('apps.habits.urls')),
    path('api/v1/study/', include('apps.study.urls')),
    path('api/v1/finance/', include('apps.finance.urls')),
    path('api/v1/notes/', include('apps.notes.urls')),
    path('api/v1/events/', include('apps.calendar_events.urls')),
]
