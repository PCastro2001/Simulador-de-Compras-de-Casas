from django.contrib import admin
from django.urls import path, include
from web_project.views import SystemView

urlpatterns = [
    path('admin/', admin.site.urls),

    # auth urls
    path("", include("auth.urls")),

    # home urls
    path("", include("apps.home.urls")),

    # subsidio urls
    path("", include("apps.subsidios.urls")),
    
    # subsidio urls
    path("", include("apps.chatbot.urls")),
]

handler404 = SystemView.as_view(template_name="misc_error.html", status=404)
handler403 = SystemView.as_view(template_name="misc_not_authorized.html", status=403)
handler400 = SystemView.as_view(template_name="misc_error.html", status=400)
handler500 = SystemView.as_view(template_name="misc_error.html", status=500)
