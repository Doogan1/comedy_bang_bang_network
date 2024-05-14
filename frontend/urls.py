from django.urls import re_path
from .views import FrontendAppView

urlpatterns = [
    re_path(r'^$', FrontendAppView.as_view(), name='app'),  # Only match the exact root
    re_path(r'^.*/$', FrontendAppView.as_view(), name='app'),  # Match any other path ending in a slash
]
