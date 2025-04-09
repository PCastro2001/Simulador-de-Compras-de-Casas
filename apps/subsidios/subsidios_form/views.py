from django.views.generic import TemplateView
from web_project import TemplateLayout
from web_project.template_helpers.theme import TemplateHelper
# from apps.subsidios.models import Subsidio

class SubsidiosFormView(TemplateView):

    def get_context_data(self, **kwargs):
        context = TemplateLayout.init(self, super().get_context_data(**kwargs))
        # subsidios = get_all_subsidios()
        context.update(
            {
                "layout": "front",
                "layout_path": TemplateHelper.set_layout("layout_front.html", context),
            }
        )
        TemplateHelper.map_context(context)
        return context
    
    # def get_all_subsidios(self):
        # return Subsidios.objects.all().order_by('id')