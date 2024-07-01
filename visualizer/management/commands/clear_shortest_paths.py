# myapp/management/commands/clear_shortest_paths.py
from django.core.management.base import BaseCommand
from visualizer.models import ShortestPath

class Command(BaseCommand):
    help = "Clears existing shortest paths from the database"

    def add_arguments(self, parser):
        parser.add_argument('network_type', type=str, help='Type of network to clear paths for, either "characters" or "guests"')

    def handle(self, *args, **options):
        network_type = options['network_type']
        self.clear_existing_shortest_paths(network_type)

    def clear_existing_shortest_paths(self, network_type):
        if network_type == 'characters':
            ShortestPath.objects.filter(start_node_character__isnull=False, end_node_character__isnull=False).delete()
        elif network_type == 'guests':
            ShortestPath.objects.filter(start_node_guest__isnull=False, end_node_guest__isnull=False).delete()
        else:
            self.stdout.write(self.style.ERROR('Invalid network type. Must be "characters" or "guests".'))
            return

        self.stdout.write(self.style.SUCCESS(f'Cleared existing shortest paths for {network_type}'))
