from django.urls import path
from .views import NetworkData, ComponentsSummary, CharacterDetailView, GuestDetailView, TestData

urlpatterns = [
    path('api/network/<str:entity_type>/', NetworkData.as_view(), name='network-data'),
    path('api/components-summary/<str:entity_type>/', ComponentsSummary.as_view(), name='components_summary'),
    path('api/characters/<int:character_id>/', CharacterDetailView.as_view(), name='character-detail'),
    path('api/guests/<int:guest_id>/', GuestDetailView.as_view(), name='guest-detail'),
    path('api/test/', TestData.as_view(), name='test-data'),
]