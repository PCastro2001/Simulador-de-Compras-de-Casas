# Renderizacion Template
from web_project import TemplateLayout
from django.views.generic import TemplateView
from web_project.template_helpers.theme import TemplateHelper

# Permisos
from django.contrib.auth.mixins import PermissionRequiredMixin

# Modelos
from django.contrib.auth.models import Group

class RolesListView(PermissionRequiredMixin, TemplateView):
    permission_required = ("auth.view_user")

    def get_context_data(self, **kwargs):
        context = TemplateLayout.init(self, super().get_context_data(**kwargs))
        grupos = self.get_all_usergroup()

        context.update(
            {
                "grupos": grupos,
            }
        )
        TemplateHelper.map_context(context)
        return context
    
    def get_all_usergroup(self):
        return Group.objects.all().order_by('id')
