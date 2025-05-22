# Renderizacion Template
from web_project import TemplateLayout
from django.views.generic import TemplateView
from web_project.template_helpers.theme import TemplateHelper

# Permisos
from django.contrib.auth.mixins import PermissionRequiredMixin

# Contrib
from apps.core.utils import get_all_permisos


class PermisosListView(PermissionRequiredMixin, TemplateView):
    permission_required = ("auth.view_user")

    def get_context_data(self, **kwargs):
        context = TemplateLayout.init(self, super().get_context_data(**kwargs))
        permisos = get_all_permisos()


        context.update(
            {
                "permisos_modelos": permisos
            }
        )
        TemplateHelper.map_context(context)
        return context
