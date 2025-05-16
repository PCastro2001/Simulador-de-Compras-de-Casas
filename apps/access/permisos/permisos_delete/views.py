# Renderizacion Template
from django.views.generic import DeleteView

# Contribuciones
from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages

# Permisos
from django.contrib.auth.mixins import PermissionRequiredMixin

# Modelos
from django.contrib.auth.models import Permission

class PermisosDeleteView(PermissionRequiredMixin, DeleteView):
    permission_required = ("auth.view_user")

    def get(self, request, pk):
        permisos = get_object_or_404(Permission, pk=pk)
        permisos.delete()

        messages.success(request, f"El grupo '{permisos.name}' fue eliminado correctamente")
        return redirect('roles-list')
        