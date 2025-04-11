from django.urls import path
from .views import PagesView

urlpatterns = [
    path(
        "pages/misc/error/",
        PagesView.as_view(template_name="pages_misc_error.html"),
        name="pages-misc-error",
    ),
    path(
        "pages/misc/under_maintenance/",
        PagesView.as_view(template_name="pages_misc_under_maintenance.html"),
        name="pages-misc-under-maintenance",
    ),
    path(
        "pages/misc/comingsoon/",
        PagesView.as_view(template_name="pages_misc_comingsoon.html"),
        name="pages-misc-comingsoon",
    ),
    path(
        "pages/misc/not_authorized/",
        PagesView.as_view(template_name="pages_misc_not_authorized.html"),
        name="pages-misc-not-authorized",
    ),
    path(
        "pages/misc/server_error/",
        PagesView.as_view(template_name="pages_misc_server_error.html"),
        name="pages-misc-server-error",
    ),
]
