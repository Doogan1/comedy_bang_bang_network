from django.core.management.base import BaseCommand
from visualizer.models import Character, Guest, CharacterComponent, GuestComponent
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
        
            # Return component_mapping to use on models

            return component_mapping
        # Paths to input and output files
        characters_file = os.path.join(settings.NETWORK_DATA_DIR, f'characters_components.json')
        guests_file = os.path.join(settings.NETWORK_DATA_DIR, f'guests_components.json')
        updated_characters_file = os.path.join(settings.NETWORK_DATA_DIR, f'characters_components_updated.json')
        updated_guests_file = os.path.join(settings.NETWORK_DATA_DIR, f'guests_components_updated.json')
        
        # Reassign component_ids for both JSON files
        characters_component_mapping = reassign_component_ids(characters_file, updated_characters_file)
        guests_component_mapping = reassign_component_ids(guests_file, updated_guests_file)

        # Update character components
        for old_id, new_id in characters_component_mapping.items():
            component = CharacterComponent.objects.get(pk=old_id)
            component.pk = new_id
            component.save()
        
        #Update guest components
        for old_id, new_id in guests_component_mapping.items():
            component = GuestComponent.objects.get(pk=old_id)
            component.pk = new_id
            component.save()

        # Update Character models with mapping
        characters = Character.objects.all()
        for character in characters:
            print(f"Updating {character.name}'s component id, which is currently {character.component.pk}")
            old_component_id = character.component.pk
            new_component_id = characters_component_mapping.get(old_component_id)
            if new_component_id is not None:
                new_component = CharacterComponent.objects.get(pk=new_component_id)
                character.component = new_component
                character.save()
            print(f"Updated to {character}.  New component_id is {character.component.pk}")
        #Update Guest models with mapping
        guests = Guest.objects.all()
        for guest in guests:
            print(f"Updating {guest.name}'s component id, which is currently {guest.component.pk}")
            old_component_id = guest.component.pk
            new_component_id = guests_component_mapping.get(old_component_id)
            print(f"Old component id is {old_component_id} and new component id is {new_component_id}")
            if new_component_id is not None:
                new_component = GuestComponent.objects.get(pk=new_component_id)
                guest.component = new_component
                guest.save()
            print(f"Updated to {guest}.  New component_id is {guest.component.pk}")
            
        self.stdout.write(self.style.SUCCESS('Successfully updated component_ids in both JSON files, the character models, and the guest models'))

