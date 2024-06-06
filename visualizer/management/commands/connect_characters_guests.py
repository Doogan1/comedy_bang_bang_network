# connect_characters_guests.py
import csv
from django.core.management.base import BaseCommand
from visualizer.models import Character, Guest, CharacterComponent, GuestComponent
from visualizer.utils import get_best_match_or_create

class Command(BaseCommand):
    help = 'Connect characters to guests based on the character-actor CSV file'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Connecting characters to guests...'))
        
        # Path to the CSV file
        csv_path = 'character-actor.csv'

        # Create or retrieve a default component
        default_char_component, _ = CharacterComponent.objects.get_or_create(name='Default Character Component')
        default_guest_component, _ = GuestComponent.objects.get_or_create(name='Default Guest Component')

        with open(csv_path, 'r') as file:
            reader = csv.reader(file)
            next(reader)  # Skip the header row
            for row in reader:
                guest_name, character_name = row
                try:
                    # Get or create the character and guest using fuzzy matching
                    character, created_char = get_best_match_or_create(Character, character_name, defaults={'component': default_char_component})
                    guest, created_guest = get_best_match_or_create(Guest, guest_name, defaults={'component': default_guest_component})
                    
                    # Create the relationship
                    character.actors.add(guest)
                    
                    # Provide feedback
                    if created_char:
                        self.stdout.write(self.style.SUCCESS(f'Created new character: {character_name}'))
                    if created_guest:
                        self.stdout.write(self.style.SUCCESS(f'Created new guest: {guest_name}'))
                    self.stdout.write(self.style.SUCCESS(f'Connected {character.name} to {guest.name}'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error connecting {character_name} to {guest_name}: {e}'))
        
        self.stdout.write(self.style.SUCCESS('Successfully connected characters to guests.'))
