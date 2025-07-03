from django.urls import path, include
from .views import HomeView, page, signup, dashboard

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('pages/<path:template>', page, name='page'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('signup/', signup, name='signup'),
    path('dashboard/', dashboard, name='dashboard'),
]
