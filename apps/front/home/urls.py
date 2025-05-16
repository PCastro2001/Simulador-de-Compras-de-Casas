from django.urls import path
from django.shortcuts import redirect
from .views import HomeViews

urlpatterns = [
    path("", lambda request: redirect('home')),
    
    path(
        "home/",
        HomeViews.as_view(template_name="home.html"),
        name="home",
    ),
    path(
        "home/subsidios",
        HomeViews.as_view(template_name="subsidios.html"),
        name="subsidios",
    ),
    path(
        "home/chatbot",
        HomeViews.as_view(template_name="chatbot.html"),
        name="chatbot"
    ),
    path(
        "home/about-us",
        HomeViews.as_view(template_name="about_us.html"),
        name="about-us",
    ),
    
]