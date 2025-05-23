# Renderizacion Template
from web_project import TemplateLayout
from django.views.generic import TemplateView
from web_project.template_helpers.theme import TemplateHelper

# Contribuciones
from apps.access.permisos.helpers import get_permisos_por_modelo

# Permisos
from django.contrib.auth.mixins import PermissionRequiredMixin

class PermisosUpdateView(PermissionRequiredMixin, TemplateView):
    permission_required = ("auth.view_user")

    def get_context_data(self, **kwargs):
        context = TemplateLayout.init(self, super().get_context_data(**kwargs))
        id_permiso = get_permisos_por_modelo(self.kwargs['pk'])

        context.update(
            {
                "id_permiso": id_permiso,
            }
        )

        TemplateHelper.map_context(context)
        return context
    
    