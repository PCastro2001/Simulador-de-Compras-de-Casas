# Collections
from collections import defaultdict

# Modelos
from django.contrib.auth.models import Group, Permission

def get_all_permisos():
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