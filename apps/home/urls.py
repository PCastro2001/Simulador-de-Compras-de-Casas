from django.urls import path
from .views import HomeViews

urlpatterns = [
    path(
        "home/",
        HomeViews.as_view(template_name="home.html"),
        name="home",
    ),

    path(
        "home/about-us",
        HomeViews.as_view(template_name="about_us.html"),
        name="about-us",
    )
]