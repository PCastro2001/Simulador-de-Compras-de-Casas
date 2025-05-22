from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from collections import defaultdict
from itertools import chain
from django.shortcuts import get_object_or_404


def get_all_permisos():
    """
    Retorna una lista de todos los permisos agrupados por modelo,
    junto con sus grupos asociados (nombre e ID).
    """
    permisos = (
        Permission.objects
        .select_related('content_type')
        .prefetch_related('group_set')
        .order_by('content_type__app_label', 'content_type__model', 'codename')
    )

    permisos_agrupados = defaultdict(lambda: {
        "id": "",
        "app_label": "",
        "model": "",
        "permisos": [],
        "grupos": set()
    })

    for permiso in permisos:
        key = f"{permiso.content_type.app_label}.{permiso.content_type.model}"

        if not permisos_agrupados[key]["app_label"]:
            permisos_agrupados[key]["id"] = permiso.content_type_id
            permisos_agrupados[key]["app_label"] = permiso.content_type.app_label
            permisos_agrupados[key]["model"] = permiso.content_type.model

        grupos = list(permiso.group_set.values("id", "name"))

        permisos_agrupados[key]["permisos"].append({
            "id": permiso.id,
            "name": permiso.name,
            "codename": permiso.codename,
            "grupos": grupos,
        })

        # Actualiza los grupos totales por modelo (como tuviste antes, ahora usando tuplas para deduplicar)
        permisos_agrupados[key]["grupos"].update((g["id"], g["name"]) for g in grupos)

    # Convertir set de tuplas a lista de dicts ordenados por nombre
    for datos in permisos_agrupados.values():
        datos["grupos"] = sorted(
            [{"id": gid, "name": gname} for gid, gname in datos["grupos"]],
            key=lambda g: g["name"]
        )

    return list(permisos_agrupados.values())

def get_permisos_por_modelo(content_type_id):
    """
    Retorna los permisos asociados a un modelo específico, junto con los grupos.
    """
    content_type = get_object_or_404(ContentType, id=content_type_id)

    permisos = (
        Permission.objects
        .filter(content_type=content_type)
        .prefetch_related('group_set')
        .order_by("codename")
    )

    permisos_con_grupos = []
    for permiso in permisos:
        grupos = list(permiso.group_set.values("id", "name"))
        permisos_con_grupos.append({
            "id": permiso.id,
            "name": permiso.name,
            "codename": permiso.codename,
            "grupos": grupos
        })

    return {
        "id": content_type.id,
        "app_label": content_type.app_label,
        "model": content_type.model,
        "permisos": permisos_con_grupos
    }