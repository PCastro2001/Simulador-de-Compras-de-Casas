from django.urls import path
from django.shortcuts import redirect
from apps.admin_home.views import AdminHomeView

urlpatterns = [
    path("", lambda request: redirect('home')),
    
    path(
        "home/",
        AdminHomeView.as_view(template_name="admin-home.html"),
        name="admin-home",
    ),
]