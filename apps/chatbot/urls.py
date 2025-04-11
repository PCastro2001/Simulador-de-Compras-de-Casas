from django.urls import path
from django.shortcuts import redirect
from .views import ChatbotView

urlpatterns = [
    path(
        "chatbot/",
        ChatbotView.as_view(template_name="chatbot.html"),
        name="chatbot",
    ),
]