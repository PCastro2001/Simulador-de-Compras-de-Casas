# Collections
from collections import defaultdict

# Modelos
from django.contrib.auth.models import Permission
from django.contrib.auth.models import Group

def get_group(pk):
    """ Obtiene el Grupo solicitado """
    return Group.objects.get(pk=pk)

def get_list_group():
    """ Crea una lista con los grupos y usuarios asignados al grupo """
    grupos = Group.objects.all().order_by('id')
    data_grupos = []

    for grupo in grupos:
        usuarios = grupo.user_set.all()
        data_grupos.append({
            "id": grupo.id,
            "name": grupo.name,
            "usuarios": usuarios,
            "total": usuarios.count()
        })
    return data_grupos

def get_all_permisos():
    """ Obtiene los permisos registrados en BD """
    
    permisos = Permission.objects.select_related("content_type").all()
    permisos_agrupados = defaultdict(list)
    
    for permiso in permisos:

        app = permiso.content_type.app_label
        model = permiso.content_type.model

        permisos_agrupados[model].append({
            "id": permiso.id,
            "codename": permiso.codename,
            "name": permiso.name,
        })
    
    orden = ['view', 'add', 'change', 'delete']

    for key, lista in permisos_agrupados.items():
        permisos_agrupados[key] = sorted(
            lista,
            key=lambda x: orden.index(x['codename'].split('_')[0])
        )

    return dict(permisos_agrupados)

def get_permisos_asignados(grupo):
    """ Obtiene los permisos asignados de un grupo en especifico """
    return set(grupo.permissions.values_list("id", flat=True))
     