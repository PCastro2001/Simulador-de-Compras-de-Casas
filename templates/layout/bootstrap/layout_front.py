from web_project.template_helpers.theme import TemplateHelper

class TemplateBootstrapLayoutFront:
    def init(context):
        context.update(
            {
                "layout": "front",
                "is_front": True,
                "display_customizer": True,
                "content_layout": "wide",
                "navbar_type": "fixed",
            }
        )

        TemplateHelper.map_context(context)

        return context