from django.conf import settings
from pprint import pprint
import os
from importlib import import_module, util

class TemplateHelper:
    # inicio context definido en TEMPLATE_CONFIG
    def init_context(context):
        context.update(
            {
                "layout": settings.TEMPLATE_CONFIG.get("layout"),
                "theme": settings.TEMPLATE_CONFIG.get("theme"),
                "style": settings.TEMPLATE_CONFIG.get("style"), 
                "has_customizer": settings.TEMPLATE_CONFIG.get("has_customizer"),
                "display_customizer": settings.TEMPLATE_CONFIG.get("display_customizer"),
                "content_layout": settings.TEMPLATE_CONFIG.get("content_layout"),
                "navbar_type": settings.TEMPLATE_CONFIG.get("navbar_type"),
                "header_type": settings.TEMPLATE_CONFIG.get("header_type"),
                "menu_fixed": settings.TEMPLATE_CONFIG.get("menu_fixed"),
                "menu_collapsed": settings.TEMPLATE_CONFIG.get("menu_collapsed"),
                "footer_fixed": settings.TEMPLATE_CONFIG.get("footer_fixed"),
                "show_dropdown_onhover": settings.TEMPLATE_CONFIG.get(
                    "show_dropdown_onhover"
                ),
                "customizer_controls": settings.TEMPLATE_CONFIG.get(
                    "customizer_controls"
                ),
            }
        )
        return context

    # logica css y context
    def map_context(context):
        # Config header horizontal
        if context.get("layout") == "horizontal":
            if context.get("header_type") == "fixed":
                context["header_type_class"] = "layout-menu-fixed"
            
            elif context.get("header_type") == "static":
                context["header_type_class"] = ""
            
            else:
                context["header_type_class"] = ""
        else:
            context["header_type_class"] = ""

        # Config navbar vertical (front)
        if context.get("layout") != "horizontal":
            if context.get("navbar_type") == "fixed":
                context["navbar_type_class"] = "layout-navbar-fixed"
            
            elif context.get("navbar_type") == "static":
                context["navbar_type_class"] = ""

            else: 
                context["navbar_type_class"] = "layout-navbar-hidden" 
        else:
            context["navbar_type_class"] = ""

        # Config menu collapsed
        context["menu_collpased_class"] = ("layou-menu-collapsed" if context.get("menu_collapsed") else "")

        # Config de menu verticales
        if context.get("layout") == "vertical":
            if context.get("menu_fixed") is True:
                context["menu_fixed_class"] = "layout-menu-fixed"
            else:
                context["menu_fixed_class"] = ""

        # Config footer fixed
        context["footer_fixed_class"] = ("layout-footer-fixed" if context.get("footer_fixed") else "")         

        # Config dropdown horizontal menu
        context["show_dropdown_onhover_value"] = ("true" if context.get("show_dropdown_onhover") else "false")

        # Display customizer
        context["display_customizer_class"] = ("" if context.get("display_customizer") else "customizer-hide")

        # Config layout
        if context.get("content_layout") == "wide":
            context["container_class"] = "container-fluid"
            context["content_layout_class"] = "layout-compact"
        else:
            context["container_class"] = "container-xxl"
            context["context_layout_class"] = "layout-compact"

        # Detached navbar
        if context.get("navbar_detached") == True:
            context["navbar_detached_class"] = "navbar-detached"
        else:
            context["navbar_detached_class"] = ""

    # Obtener variables del template de .template.py
    def get_theme_variables(scope):
        return settings.THEME_VARIABLES[scope]

    def get_theme_config(scope):
        return settings.TEMPLATE_CONFIG[scope]

    def set_layout(view, context={}):
        layout = os.path.splitext(view)[0].split("/")[0]
        module = f"templates.{settings.THEME_LAYOUT_DIR.replace('/', '.')}.bootstrap.{layout}"

        if util.find_spec(module) is not None:
            TemplateBootstrap = TemplateHelper.import_class(
                module, f"TemplateBootstrap{layout.title().replace('_', '')}"
            )
            TemplateBootstrap.init(context)
        else:
            module = f"templates.{settings.THEME_LAYOUT_DIR.replace('/', '.')}.bootstrap.default"

            TemplateBootstrap = TemplateHelper.import_class(
                module, "TemplateBootstrapDefault"
            )
            TemplateBootstrap.init(context)

        return f"{settings.THEME_LAYOUT_DIR}/{view}"

    # Import a module by string
    def import_class(fromModule, import_className):
        pprint(f"Loading {import_className} from {fromModule}")
        module = import_module(fromModule)
        return getattr(module, import_className)
