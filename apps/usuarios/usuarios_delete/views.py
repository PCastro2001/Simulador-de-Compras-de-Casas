# Renderizacion Template
from django.views.generic import DeleteView

# Contribuciones
from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages

# Permisos
from django.contrib.auth.mixins import PermissionRequiredMixin

# Modelos
from django.contrib.auth.models import User

class UsuariosDeleteView(PermissionRequiredMixin, DeleteView):
    permission_required = ("auth.view_user")

    def get(self, request, pk):
        usuario = get_object_or_404(User, pk=pk)
        usuario.delete()

        messages.success(request, f"El Usuario '{usuario.name}' fue eliminado correctamente")
        return redirect('usuarios-list')
        