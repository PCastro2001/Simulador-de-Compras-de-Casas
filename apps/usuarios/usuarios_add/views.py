# Renderizacion Template
from web_project import TemplateLayout
from django.views.generic import TemplateView
from web_project.template_helpers.theme import TemplateHelper

# Contrib
from django.shortcuts import render, redirect
from django.contrib import messages

# Permisos
from django.contrib.auth.mixins import PermissionRequiredMixin

# Modelo
from django.contrib.auth.models import Group

# Formularios
from apps.usuarios.forms import AddUsuarioForm

class UsuariosAddView(PermissionRequiredMixin, TemplateView):
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
    
    def post(self, request):
        form = AddUsuarioForm(request.POST)
        if form.is_valid():
            usuario, password = form.save()
            messages.success(request, f"Usuario creado. Contraseña: {password}")
            return redirect("usuarios-add")
        else:
            messages.error(request, f"Error al crear usuario  {form.errors}")
            return redirect(f"usuarios-add" )
        
        # return render(request, "usuarios_add.html", {
        #         "form_errors": form.errors,
        #         "form_data": request.POST,
        #     })
            