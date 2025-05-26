# Renderizacion Template
from web_project import TemplateLayout
from django.views.generic import TemplateView
from web_project.template_helpers.theme import TemplateHelper

# Contribuciones
from django.shortcuts import redirect
from django.contrib import messages
from apps.access.roles.helpers import get_all_permisos

# Permisos
from django.contrib.auth.mixins import PermissionRequiredMixin

# Modelos
from django.contrib.auth.models import Group

# Formularios
from apps.access.roles.forms import AddRoleForm

class RolesAddView(PermissionRequiredMixin, TemplateView):
    permission_required = ("auth.view_user")

    def get_context_data(self, **kwargs):
        context = TemplateLayout.init(self, super().get_context_data(**kwargs))
        permisos = get_all_permisos()

        context.update(
            {
                "permisos": permisos,
            }
        )
        TemplateHelper.map_context(context)
        return context
    
    
    def post(self, request, *args, **kwargs):
        form = AddRoleForm(request.POST)
        if form.is_valid():

            nombre = form.cleaned_data["rolename"]
            permisos = form.cleaned_data["permissions"]

            grupo = Group.objects.create(name=nombre)
            grupo.permissions.set(permisos)
            
            messages.success(request, 'Grupo creado con éxito')
            
            return redirect('roles-list')

        else:
            messages.error(request, 'Error al crear el grupo')
            return redirect('roles-add')

        return redirect('roles-list')


