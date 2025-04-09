from django.urls import path
from django.shortcuts import redirect
from .subsidios_list.views import SubsidiosListView
from .subsidios_form.views import SubsidiosFormView

urlpatterns = [
    
    path(
        "subsidios/list/",
        SubsidiosListView.as_view(template_name="subsidios_list.html"),
        name="subsidios-list",
    ),

    # urls DS49
    path(
        "subsidios/ds49/",
        SubsidiosListView.as_view(template_name="subsidios_ds49.html"),
        name="subsidios-ds49",
    ),

    # urls DS1 Tramo 1
    path(
        "subsidios/ds1/tramo-1",
        SubsidiosListView.as_view(template_name="subsidios_ds1_tramo_1.html"),
        name="subsidios-ds1-tramo-1",
    ),

    # urls DS1 Tramo 2
    path(
        "subsidios/ds1/tramo-2",
        SubsidiosListView.as_view(template_name="subsidios_ds1_tramo_2.html"),
        name="subsidios-ds1-tramo-2",
    ),

    # urls DS1 Tramo 3
    path(
        "subsidios/ds1/tramo-3",
        SubsidiosListView.as_view(template_name="subsidios_ds1_tramo_3.html"),
        name="subsidios-ds1-tramo-3",
    ),

    # urls DS19
    path(
        "subsidios/ds19/",
        SubsidiosListView.as_view(template_name="subsidios_ds19.html"),
        name="subsidios-ds19",
    ),
]