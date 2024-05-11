from django.core.management.base import BaseCommand
import json
from .create_character_network import Command as NetworkCommand
import os
from django.conf import settings
import numpy as np

class Command(BaseCommand):
    help = 'Generates and stores the co-appearance network data'

    def handle(self, *args, **options):
        network_command = NetworkCommand()
        components = network_command.create_co_appearance_network()

        for component in components:
            for node in component['nodes']:
                # Convert numpy arrays to lists if present
                if isinstance(node['position'], np.ndarray):
                    node['position'] = node['position'].tolist()

        # Ensure the directory exists
        os.makedirs(settings.NETWORK_DATA_DIR, exist_ok=True)

        # Path to the components file
        file_path = os.path.join(settings.NETWORK_DATA_DIR, 'components.json')
        
        with open(file_path, 'w') as file:
            json.dump(components, file)
        
        self.stdout.write(self.style.SUCCESS('Network data generated and saved at {}'.format(file_path)))
