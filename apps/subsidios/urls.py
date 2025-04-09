from django.urls import path
from django.shortcuts import redirect
from .subsidios_list.views import SubsidiosListView

urlpatterns = [
    
    path(
        "subsidios/list/",
        SubsidiosListView.as_view(template_name="subsidios_list.html"),
        name="subsidios-list",
    ),
]