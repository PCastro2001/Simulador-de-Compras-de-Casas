
# from web_project.bootstrap import TemplateBootstrap
from web_project.template_helpers.theme import TemplateHelper
from django.conf import settings


class TemplateLayout:
    def init(self, context):
        context = TemplateHelper.init_context(context)
        layout = context["layout"]

        context.update(
            {
                "layout_path": TemplateHelper.set_layout
                (
                    "layout_" + layout + ".html", context
                ),
            }
        )

        TemplateHelper.map_context(context)

        return context
