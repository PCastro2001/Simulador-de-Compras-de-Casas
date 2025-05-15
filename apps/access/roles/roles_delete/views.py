# Renderizacion Template
from django.views.generic import DeleteView

# Contribuciones
from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages

# Permisos
from django.contrib.auth.mixins import PermissionRequiredMixin

# Modelos
from django.contrib.auth.models import Group

class RolesDeleteView(PermissionRequiredMixin, DeleteView):
    permission_required = ("auth.view_user")

    def get(self, request, pk):
        grupo = get_object_or_404(Group, pk=pk)
        grupo.delete()

        messages.success(request, f"El grupo '{grupo.name}' fue eliminado correctamente")
        return redirect('roles-list')
        