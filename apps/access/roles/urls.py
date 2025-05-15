from django.urls import path
from django.contrib.auth.decorators import login_required

# Views personalizados
from apps.access.roles.roles_list.views import RolesListView
from apps.access.roles.roles_add.views import RolesAddView
from apps.access.roles.roles_update.views import RolesUpdateView
from apps.access.roles.roles_delete.views import RolesDeleteView

urlpatterns = [
    path(
        "access/roles/",
        login_required(RolesListView.as_view(template_name="roles_list.html")),
        name="roles-list",
    ),
    path(
        "access/roles/add/",
        login_required(RolesAddView.as_view(template_name="roles_add.html")),
        name="roles-add",
    ),
    path(
        "access/roles/update/<int:pk>/",
        login_required(RolesUpdateView.as_view(template_name="roles_update.html")),
        name="roles-update",
    ),
    path(
        "access/roles/delete/<int:pk>/",
        login_required(RolesDeleteView.as_view()),
        name="roles-delete",
    )
]
