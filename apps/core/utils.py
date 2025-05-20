from django.contrib.auth.models import Permission
from django.db.models import Prefetch
from django.contrib.contenttypes.models import ContentType

def validar_rut(rut):
    pass

def get_usuario(usuario):
    pass

def suma(valor_1, valor_2):
    pass

def resta(valor_1, valor_2):
    pass

def get_all_grupos():
    pass

def get_all_permisos():
    """
    Retorna una lista de todos los permisos junto con su aplicación y modelo
    """
    permisos = (
        Permission.objects
        .select_related('content_type')
        .prefetch_related('group_set')  # para obtener grupos asignados
        .order_by('content_type__app_label', 'content_type__model', 'codename')
    )

    permisos_data = []
    for permiso in permisos:
        permisos_data.append({
            "id": permiso.id,
            "name": permiso.name,
            "codename": permiso.codename,
            "app_label": permiso.content_type.app_label,
            "model": permiso.content_type.model,
            "grupos": list(permiso.group_set.values_list("name", flat=True))
        })

    return permisos_data