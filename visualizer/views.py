from rest_framework.views import APIView
from rest_framework.response import Response
import json
from django.conf import settings
from django.shortcuts import get_object_or_404
import os
from visualizer.models import Character, Guest, Episode, CharacterComponent, GuestComponent, ShortestPath
from django.http import Http404

class NetworkData(APIView):
    def get(self, request, entity_type, format=None):
        # Validate entity_type
        if entity_type not in ['characters', 'guests']:
            return Response({'error': 'Invalid entity type'}, status=400)

        file_path = os.path.join(settings.NETWORK_DATA_DIR, f'{entity_type}_components_updated.json')
        
        try:
            with open(file_path, 'r') as file:
                components = json.load(file)
        except FileNotFoundError:
            return Response({'error': 'Data file not found'}, status=404)

        # Get corresponding Component model
        ComponentModel = CharacterComponent if entity_type == 'characters' else GuestComponent
        component_map = {component.id: index for index, component in enumerate(ComponentModel.objects.all())}

        if 'count' in request.query_params:
            return Response({'count': len(components)})

        component_id = int(request.query_params.get('component', 0))
        component_index = component_map.get(component_id, 0)
        component_data = components[component_index] if component_index < len(components) else {'nodes': [], 'edges': []}

        return Response(component_data)


class ComponentsSummary(APIView):
    def get(self, request, entity_type, format=None):
        # Validate entity type
        if entity_type not in ['characters', 'guests']:
            return Response({'error': 'Invalid entity type'}, status=400)
        
        # Load pre-computed components data
        file_path = os.path.join(settings.NETWORK_DATA_DIR, f'{entity_type}_components_updated.json')
        try:
            with open(file_path, 'r') as file:
                components = json.load(file)
        except FileNotFoundError:
            return Response({'error': 'Data file not found'}, status=404)
        
        # Get corresponding Component model
        ComponentModel = CharacterComponent if entity_type == 'characters' else GuestComponent
        component_map = {component.id: index for index, component in enumerate(ComponentModel.objects.all())}

        summary = [{'id': component_id, 'size': len(comp['nodes']), 'percentage': (len(comp['nodes']) / sum(len(c['nodes']) for c in components) * 100)} for component_id, comp in zip(component_map.keys(), components)]
        return Response(summary)

    
class CharacterDetailView(APIView):
    def get(self, request, character_id):
        try:
            character = Character.objects.get(pk=character_id)
            actors = character.actors.all()
            actor_data = [{'name': actor.name, 'id': actor.id, 'component': actor.component.id} for actor in actors]
            episodes = character.episodes.all()
            episodes_data = [{'id': episode.id, 'title': episode.title, 'release_date': episode.release_date, 'episode_number': episode.number} for episode in episodes]
            return Response({
                'character_id': character.id,
                'character_name': character.name,
                'component': character.component.id,
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
            characters = guest.characters.all()
            character_data = [{'name': character.name, 'id': character.id, 'component': character.component.id} for character in characters]
            episodes_data = [{'id': episode.id, 'title': episode.title, 'release_date': episode.release_date, 'episode_number': episode.number} for episode in episodes]
            return Response({
                'character_id': guest.id,
                'character_name': guest.name,
                'component': guest.component.id,
                'characters': character_data,
                'episodes': episodes_data
            })
        except Guest.DoesNotExist:
            raise Http404
        
class EpisodeDetailView(APIView):
    def get(self, request):
        try:
            episodes = Episode.objects.all()
            details = [
                {
                    'title': episode.title,
                    'episode_number': episode.number,
                    'release_date': episode.release_date,
                    'characters': [
                        {
                            'id': character.id,
                            'name': character.name
                        }
                        for character in episode.characters.all()
                    ],
                    'guests': [
                        {
                            'id': guest.id,
                            'name': guest.name
                        }
                        for guest in episode.guests.all()
                    ]
                }
                for episode in episodes
            ]
            return Response(details)
        except Episode.DoesNotExist:
            raise Http404

class ShortestPathView(APIView):
    def get(self, request, start_node_id, end_node_id, format=None):
        start_node_guest = Guest.objects.filter(id=start_node_id).first()
        end_node_guest = Guest.objects.filter(id=end_node_id).first()
        start_node_character = Character.objects.filter(id=start_node_id).first()
        end_node_character = Character.objects.filter(id=end_node_id).first()
        
        if start_node_guest and end_node_guest:
            shortest_path = get_object_or_404(ShortestPath, start_node_guest=start_node_guest, end_node_guest=end_node_guest)
        elif start_node_character and end_node_character:
            shortest_path = get_object_or_404(ShortestPath, start_node_character=start_node_character, end_node_character=end_node_character)
        else:
            return Response({'error': 'Invalid node IDs'}, status=404)
        
        return Response({
            'start_node': start_node_id,
            'end_node': end_node_id,
            'path': shortest_path.path,
            'length': shortest_path.length
        })