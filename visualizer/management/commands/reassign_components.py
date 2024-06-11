from django.core.management.base import BaseCommand
import json
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Reassigns component_ids in JSON files based on their current order in the file'

    def handle(self, *args, **options):
        def reassign_component_ids(file_path, output_path):
            with open(file_path, 'r') as f:
                data = json.load(f)

            # Create the new component_id mapping
            component_mapping = {component['component_id']: index for index, component in enumerate(data)}
            print(component_mapping)
            # Apply the new component_id mapping to the nodes
            for index, component in enumerate(data):
                old_component_id = component['component_id']
                component['component_id'] = component_mapping[old_component_id]
            
            # Save the updated data
            with open(output_path, 'w') as f:
                json.dump(data, f, indent=2)
        
        # Paths to input and output files
        characters_file = os.path.join(settings.NETWORK_DATA_DIR, f'characters_components.json')
        guests_file = os.path.join(settings.NETWORK_DATA_DIR, f'guests_components.json')
        updated_characters_file = os.path.join(settings.NETWORK_DATA_DIR, f'characters_components_updated.json')
        updated_guests_file = os.path.join(settings.NETWORK_DATA_DIR, f'guests_components_updated.json')
        
        # Reassign component_ids for both JSON files
        reassign_component_ids(characters_file, updated_characters_file)
        reassign_component_ids(guests_file, updated_guests_file)
        
        self.stdout.write(self.style.SUCCESS('Successfully updated component_ids in both JSON files'))

