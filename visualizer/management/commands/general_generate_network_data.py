from django.core.management.base import BaseCommand
import json
from .create_coappearance_network import Command as NetworkCommand
import os
from django.conf import settings
import numpy as np

class Command(BaseCommand):
    help = 'Generates and stores the co-appearance network data based on characters or guests'

    def add_arguments(self, parser):
        parser.add_argument('-t', '--type', type=str, choices=['characters', 'guests'], default='characters', help='Specify whether to use characters or guests for the network')

    def handle(self, *args, **options):
        network_command = NetworkCommand()
        # Pass the entity type from the options to the network creation function
        entity_type = options['type']
        components = network_command.create_coappearance_network(entity_type)

        for component in components:
            for node in component['nodes']:
                # Convert numpy arrays to lists if present
                if isinstance(node['position'], np.ndarray):
                    node['position'] = node['position'].tolist()

        # Ensure the directory exists
        os.makedirs(settings.NETWORK_DATA_DIR, exist_ok=True)

        # Path to the components file
        file_path = os.path.join(settings.NETWORK_DATA_DIR, f"{entity_type}_components.json")
        
        with open(file_path, 'w') as file:
            json.dump(components, file)
        
        self.stdout.write(self.style.SUCCESS(f'Network data for {entity_type} generated and saved at {file_path}'))

