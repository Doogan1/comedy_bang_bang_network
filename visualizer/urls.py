from django.urls import path
from . import views
from .views import index, NetworkData, ComponentsSummary, CharacterDetailView, GuestDetailView

urlpatterns = [
    path('', views.index, name='index'),
    path('api/network/<str:entity_type>/', NetworkData.as_view(), name='network-data'),
    path('api/components-summary/<str:entity_type>/', ComponentsSummary.as_view(), name='components_summary'),
    path('api/characters/<int:character_id>/', CharacterDetailView.as_view(), name='character-detail'),
    path('api/guests/<int:guest_id>/', GuestDetailView.as_view(), name='guest-detail'),
]