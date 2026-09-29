"""
LifeOS Specialized FastAPI Service
High-throughput analytics, statistical processing, and AI assistant service
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import datetime

app = FastAPI(
    title="LifeOS Specialized Analytics & AI Service",
    description="Dedicated FastAPI microservice providing productivity intelligence, study analytics, and AI recommendations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AssistantPromptRequest(BaseModel):
    prompt: str = Field(..., example="What should I focus on today?")
    user_id: Optional[int] = Field(default=1)

class AssistantResponse(BaseModel):
    reply: str
    recommendations: List[str]
    timestamp: str

class ProductivityAnalyticsResponse(BaseModel):
    productivity_score: int
    weekly_trend: List[int]
    tasks_completion_rate: float
    habit_consistency_index: float
    study_hours_this_week: float
    deep_work_focus_ratio: float
    generated_at: str

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "LifeOS FastAPI Specialized Engine"}

@app.get("/api/v1/analytics/productivity/", response_model=ProductivityAnalyticsResponse)
def get_productivity_analytics(user_id: int = 1):
    return ProductivityAnalyticsResponse(
        productivity_score=87,
        weekly_trend=[72, 75, 80, 84, 88, 92, 87],
        tasks_completion_rate=78.5,
        habit_consistency_index=82.0,
        study_hours_this_week=12.75,
        deep_work_focus_ratio=0.74,
        generated_at=datetime.datetime.utcnow().isoformat()
    )

@app.post("/api/v1/ai/assistant/", response_model=AssistantResponse)
def ask_ai_assistant(request: AssistantPromptRequest):
    prompt = request.prompt.lower()
    
    if "focus" in prompt or "today" in prompt:
        reply = (
            "Based on your LifeOS schedule, you have 2 high-priority tasks due today: "
            "'Complete Python assignment' (10:00 AM) and 'Update resume' (9:00 PM). "
            "I recommend starting with a 50-minute Pomodoro session on your Python assignment."
        )
        recommendations = [
            "Start 50-minute Pomodoro",
            "Review Django documentation next",
            "Hydrate before 5:00 PM workout"
        ]
    elif "productivity" in prompt or "analyze" in prompt:
        reply = (
            "Your weekly productivity score is 87%! You have maintained a 12-day streak on Python practice "
            "and completed 12h 45m of study this week. Keep an eye on your 11 PM sleep habit to prevent burnout."
        )
        recommendations = [
            "Maintain Python streak",
            "Log tonight's study session",
            "Aim for 7+ hours sleep"
        ]
    elif "money" in prompt or "spend" in prompt or "expense" in prompt:
        reply = (
            "This month you earned ₹25,000 and spent ₹8,450, yielding ₹16,550 in savings (66% savings rate!). "
            "Your largest expense category was Travel and Cloud Hosting."
        )
        recommendations = [
            "Set monthly travel cap",
            "Review recurring cloud subscriptions",
            "Allocate ₹5,000 to emergency fund"
        ]
    else:
        reply = (
            "I am your LifeOS AI assistant powered by the FastAPI analytical service. "
            "I can help organize your study goals, optimize your Pomodoro focus, or break down complex projects into actionable milestones."
        )
        recommendations = [
            "What should I focus on today?",
            "Analyze my productivity",
            "Where am I spending too much money?"
        ]

    return AssistantResponse(
        reply=reply,
        recommendations=recommendations,
        timestamp=datetime.datetime.utcnow().isoformat()
    )

@app.get("/api/v1/recommendations/")
def get_daily_recommendations(user_id: int = 1):
    return {
        "user_id": user_id,
        "actionable_insights": [
            {"type": "study", "message": "You are 2 hours away from your weekly 15-hour study target in Python & Django."},
            {"type": "habit", "message": "Logging your Gym habit today will extend your streak to 6 days."},
            {"type": "finance", "message": "You have spent only ₹620 today, keeping you well under your daily ₹1,000 threshold."}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
