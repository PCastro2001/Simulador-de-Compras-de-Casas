from django.conf import settings
import json

from web_project.template_helpers.theme import TemplateHelper

menu_file_path =  settings.BASE_DIR / "templates" / "layout" / "partials" / "menu" / "horizontal" / "json" / "horizontal_menu.json"

class TemplateBootstrapLayoutFront:
    def init(context):
        context.update(
            {
                "layout": "horizontal",
                "is_navbar": True,
                "navbar_full": True,
                "is_menu": True,
                "menu_horizontal": True,
                "is_footer": True,
                "navbar_detached": False
            }
        )

        TemplateHelper.map_context(context)

        TemplateBootstrapLayoutFront.ini_menu_data(context)
        return context
    
    def init_menu_data(context):
        menu_data = json.load(menu_file_path.open()) if menu_file_path.exists() else []
        context.update({"menu_data": menu_data})
