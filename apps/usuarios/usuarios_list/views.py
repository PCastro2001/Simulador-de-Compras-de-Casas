# Renderizacion Template
from web_project import TemplateLayout
from django.views.generic import TemplateView
from web_project.template_helpers.theme import TemplateHelper

# Permisos
from django.contrib.auth.mixins import PermissionRequiredMixin

# Contrib
from apps.usuarios.helpers import get_all_user

class UsuariosListView(PermissionRequiredMixin, TemplateView):
    permission_required = ("auth.view_user")

    def get_context_data(self, **kwargs):
        context = TemplateLayout.init(self, super().get_context_data(**kwargs))
        usuarios = get_all_user()

        context.update(
            {
                "usuarios": usuarios,
            }
        )
        TemplateHelper.map_context(context)
        return context
    