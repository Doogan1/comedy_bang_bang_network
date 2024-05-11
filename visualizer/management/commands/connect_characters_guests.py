from django.core.management.base import BaseCommand
from visualizer.models import Character, Guest
import csv
import os

class Command(BaseCommand):
    help = 'Imports character and actor data from a CSV file'


    def handle(self, *args, **options):
        self.import_data('data/character-actor.csv')

    def import_data(self, file_path):
        with open(file_path, 'r', newline='', encoding='utf-8') as file:
            reader = csv.reader(file)
            for row in reader:
                if row:  # Ensure the row is not empty
                    character_name = row[0].strip()
                    actor_names = row[1:]  # Get all names after the first column

                    # Get or create the character
                    character, created = Character.objects.get_or_create(name=character_name)

                    # Process each actor in the list
                    for actor_name in actor_names:
                        if actor_name.strip():  # Ensure the actor name is not empty
                            actor, _ = Guest.objects.get_or_create(name=actor_name.strip())
                            character.actors.add(actor)  # Add this actor to the character

                    self.stdout.write(self.style.SUCCESS(f'Successfully imported actors for character: {character_name}'))

