from django.urls import path
from django.contrib.auth.decorators import login_required

# Views personalizados
from apps.access.permisos.permisos_list.views import PermisosListView
from apps.access.permisos.permisos_add.views import PermisosAddView
from apps.access.permisos.permisos_update.views import PermisosUpdateView
from apps.access.permisos.permisos_delete.views import PermisosDeleteView

urlpatterns = [
    path(
        "access/permisos/list/",
        login_required(PermisosListView.as_view(template_name="permisos_list.html")),
        name="permisos-list",
    ),
    path(
        "access/permisos/add/",
        login_required(PermisosAddView.as_view(template_name="permisos_add.html")),
        name="permisos-add",
    ),
    path(
        "access/permisos/update/<int:pk>/",
        login_required(PermisosUpdateView.as_view(template_name="permisos_update.html")),
        name="permisos-update",
    ),
    path(
        "access/permisos/delete/<int:pk>/",
        login_required(PermisosDeleteView.as_view()),
        name="permisos-delete",
    )
]
