from django.core.management.base import BaseCommand
from visualizer.models import Character

class Command(BaseCommand):
    help = 'Displays all characters and their associated data'

    def handle(self, *args, **options):
        characters = Character.objects.all().prefetch_related('actors')
        if characters:
            self.stdout.write(self.style.SUCCESS('Listing all characters:'))
            for character in characters:
                # Retrieve the names of all actors linked to the character
                actor_names = [actor.name for actor in character.actors.all()]
                actor_names_str = ', '.join(actor_names)  # Format actor names into a string
                self.stdout.write(f'Name: {character.name}, Actors: {actor_names_str}')
        else:
            self.stdout.write(self.style.WARNING('No characters found in the database.'))

