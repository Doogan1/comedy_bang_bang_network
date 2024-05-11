from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
import json
from django.conf import settings
import os
from visualizer.models import Character, Guest
from django.http import Http404

def index(request):
    return render(request, 'visualizer/index.html')

class NetworkData(APIView):
    def get(self, request, entity_type, format=None):
        # Validate entity_type
        if entity_type not in ['characters', 'guests']:
            return Response({'error': 'Invalid entity type'}, status=400)

        file_path = os.path.join(settings.NETWORK_DATA_DIR, f'{entity_type}_components.json')

        try:
            with open(file_path, 'r') as file:
                components = json.load(file)
        except FileNotFoundError:
            return Response({'error': 'Data file not found'}, status=404)

        if 'count' in request.query_params:
            return Response({'count': len(components)})

        component_index = int(request.query_params.get('component', 0))
        component_data = components[component_index] if component_index < len(components) else {'nodes': [], 'edges': []}

        return Response(component_data)

class ComponentsSummary(APIView):
    def get(self, request, entity_type, format=None):
        #validate entity type
        if entity_type not in ['characters', 'guests']:
            return Response({'error': 'Invalid entity type'}, status=400)
        
        # Load pre-computed components data
        with open(f'network_data/{entity_type}_components.json', 'r') as file:
            components = json.load(file)
        summary = [{'index': i, 'size': len(comp['nodes']), 'percentage': (len(comp['nodes']) / sum(len(c['nodes']) for c in components) * 100)} for i, comp in enumerate(components)]
        return Response(summary)
    
class CharacterDetailView(APIView):
    def get(self, request, character_id):
        try:
            character = Character.objects.get(pk=character_id)
            actors = character.actors.all()
            actor_data = [{'name': actor.name, 'id': actor.id} for actor in actors]
            episodes = character.episodes.all()
            episodes_data = [{'id': episode.id, 'title': episode.title, 'release_date': episode.release_date, 'episode_number': episode.number} for episode in episodes]
            return Response({
                'character_id': character.id,
                'character_name': character.name,
                'actors': actor_data,
                'episodes': episodes_data
            })
        except Character.DoesNotExist:
            raise Http404
        
class GuestDetailView(APIView):
    def get(self, request, guest_id):
        try:
            guest = Guest.objects.get(pk=guest_id)
            episodes = guest.episodes.all()
            episodes_data = [{'id': episode.id, 'title': episode.title, 'release_date': episode.release_date, 'episode_number': episode.number} for episode in episodes]
            return Response({
                'character_id': guest.id,
                'character_name': guest.name,
                'episodes': episodes_data
            })
        except Guest.DoesNotExist:
            raise Http404
