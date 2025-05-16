from django.urls import path
from django.contrib.auth.decorators import login_required

# Views Personalizadas
from .subsidios_list.views import SubsidiosListView

urlpatterns = [
    
    path(
        "subsidios/list/",
        login_required(SubsidiosListView.as_view(template_name="subsidios_list.html")),
        name="subsidios-list",
    ),
]