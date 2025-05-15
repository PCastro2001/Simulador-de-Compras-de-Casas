# Renderizacion Template
from web_project import TemplateLayout
from django.views.generic import TemplateView
from web_project.template_helpers.theme import TemplateHelper

# Permisos
from django.contrib.auth.mixins import PermissionRequiredMixin

# Modelo
from django.contrib.auth.models import User




class UsuariosDetailView(PermissionRequiredMixin, TemplateView):
    permission_required = ("auth.view_user")

    def get_context_data(self, **kwargs):
        context = TemplateLayout.init(self, super().get_context_data(**kwargs))
        usuario = self.get_rol(self.kwargs['pk'])

        context.update(
            {
                "id_usuario": usuario,
            }
        )

        TemplateHelper.map_context(context)
        return context
    
    def get_usuario(self, pk):
        return User.objects.get(pk=pk)