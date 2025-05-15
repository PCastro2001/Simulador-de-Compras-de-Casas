from django.contrib import admin
from django.urls import path, include
from web_project.views import SystemView

urlpatterns = [
    

    # -------------------- FRONT --------------------
    # HOME
    path("", include("apps.front.home.urls")),


    # -------------------- BACKEND --------------------
    path("admin/", include("apps.admin_home.urls")),
    path("admin/", include("apps.access.roles.urls")),
    
    path("admin/", include("auth.urls")),

    path('admin/', admin.site.urls),
    
]

handler404 = SystemView.as_view(template_name="misc_error.html", status=404)
handler403 = SystemView.as_view(template_name="misc_not_authorized.html", status=403)
handler400 = SystemView.as_view(template_name="misc_error.html", status=400)
handler500 = SystemView.as_view(template_name="misc_error.html", status=500)
