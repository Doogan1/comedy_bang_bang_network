from django.urls import path
from .views import NetworkData, ComponentsSummary, CharacterDetailView, GuestDetailView

urlpatterns = [
    path('network/<str:entity_type>/', NetworkData.as_view(), name='network-data'),
    path('components-summary/<str:entity_type>/', ComponentsSummary.as_view(), name='components_summary'),
    path('characters/<int:character_id>/', CharacterDetailView.as_view(), name='character-detail'),
    path('guests/<int:guest_id>/', GuestDetailView.as_view(), name='guest-detail'),
]