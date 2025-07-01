from django.urls import path
from .views import HomeView, page

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('index.html', HomeView.as_view()),
    path('pages/<path:template>', page, name='page'),
]
