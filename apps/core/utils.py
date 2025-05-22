from django.contrib.auth.models import Permission
from collections import defaultdict
from itertools import chain

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
    Retorna una lista de todos los permisos agrupados por modelo,
    junto con sus grupos asociados.
    """
    permisos = (
        Permission.objects
        .select_related('content_type')
        .prefetch_related('group_set')
        .order_by('content_type__app_label', 'content_type__model', 'codename')
    )

    permisos_agrupados = defaultdict(lambda: {
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

        grupos = list(permiso.group_set.values_list("name", flat=True))
        permisos_agrupados[key]["permisos"].append({
            "id": permiso.id,
            "name": permiso.name,
            "codename": permiso.codename,
            "grupos": grupos
        })

        permisos_agrupados[key]["grupos"].update(grupos)

    # Convertir sets a listas ordenadas
    for datos in permisos_agrupados.values():
        datos["grupos"] = sorted(datos["grupos"])

    return list(permisos_agrupados.values())

# from collections import defaultdict
# from django.contrib.auth.models import Permission
# from django.db.models import Prefetch

# def get_all_permisos():
#     """
#     Retorna los permisos agrupados por modelo y aplicación.
#     """
#     permisos = (
#         Permission.objects
#         .select_related('content_type')
#         .prefetch_related('group_set')
#         .order_by('content_type__app_label', 'content_type__model', 'codename')
#     )

#     permisos_por_modelo = defaultdict(lambda: {
#         "app_label": "",
#         "model": "",
#         "permisos": []
#     })

#     for permiso in permisos:
#         key = f"{permiso.content_type.app_label}.{permiso.content_type.model}"

#         permisos_por_modelo[key]["app_label"] = permiso.content_type.app_label
#         permisos_por_modelo[key]["model"] = permiso.content_type.model
#         permisos_por_modelo[key]["permisos"].append({
#             "id": permiso.id,
#             "name": permiso.name,
#             "codename": permiso.codename,
#             "grupos": list(permiso.group_set.values_list("name", flat=True)),
#         })

#     return permisos_por_modelo
