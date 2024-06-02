from django.core.management.base import BaseCommand
from visualizer.models import Character, Guest

class Command(BaseCommand):
    help = 'Verify connections between guests and characters'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Verifying connections between guests and characters...'))
        
        # Get all guests
        guests = Guest.objects.all()
        
        for guest in guests:
            # Get all characters associated with the guest
            characters = guest.characters.all()
            character_names = [character.name for character in characters]
            self.stdout.write(f'Guest: {guest.name} - Characters: {", ".join(character_names) if character_names else "None"}')
        
        self.stdout.write(self.style.SUCCESS('Verification complete.'))
