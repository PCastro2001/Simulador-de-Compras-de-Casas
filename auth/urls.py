from django.urls import path

# Contrib
from django.contrib.auth.views import LogoutView

# Views personalizadsos
from .login.views import LoginView
from .register.views import RegisterView

urlpatterns = [

    path(
        "login/",
        LoginView.as_view(template_name = "auth/login.html"),
        name="login"
    ),
    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),
    path(
        "register/",
        RegisterView.as_view(template_name="auth/register.html"),
        name="register",
    )
]