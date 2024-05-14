from django.urls import re_path, path
from .views import FrontendAppView

urlpatterns = [
    re_path('.*', FrontendAppView.as_view(), name='app'),
]
