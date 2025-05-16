# Renderizacion Template
from web_project import TemplateLayout
from django.views.generic import TemplateView
from web_project.template_helpers.theme import TemplateHelper

# Contribuciones


# Permisos
from django.contrib.auth.mixins import PermissionRequiredMixin

# Modelos
from django.contrib.auth.models import Permission

# Formularios


class PermisosAddView(PermissionRequiredMixin, TemplateView):
    permission_required = ("auth.view_user")

    def get_context_data(self, **kwargs):
        context = TemplateLayout.init(self, super().get_context_data(**kwargs))

        context.update(
            {

            }
        )
        TemplateHelper.map_context(context)
        return context
    
    
    