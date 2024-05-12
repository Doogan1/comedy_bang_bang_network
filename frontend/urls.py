from django.urls import path, re_path
from .views import FrontendAppView

urlpatterns = [
    re_path(r'^.*$', FrontendAppView.as_view(), name='app'),
]
