from django.core.management.base import BaseCommand
from visualizer.models import ShortestPath

class Command(BaseCommand):
    help = 'Displays all shortest paths and their associated data'

    def handle(self, *args, **options):
        paths = ShortestPath.objects.all()
        if paths:
            self.stdout.write(self.style.SUCCESS('Listing all paths:'))
            for path in paths:
                start_node = path.start_node_guest if path.start_node_guest else path.start_node_character
                end_node = path.end_node_guest if path.end_node_guest else path.end_node_character
                start_node_name = start_node.name if start_node else 'Unknown'
                end_node_name = end_node.name if end_node else 'Unknown'
                self.stdout.write(f'Path from {start_node_name} to {end_node_name}:')
                self.stdout.write(f'  Path: {path.path}')
                self.stdout.write(f'  Length: {path.length}')
        else:
            self.stdout.write(self.style.WARNING('No shortest paths found in the database.'))
