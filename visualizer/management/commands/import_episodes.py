from django.core.management.base import BaseCommand
import csv
from visualizer.models import Episode, Character, Guest

class Command(BaseCommand):
    help = 'Import episodes and characters from a CSV file'


    def handle(self, *args, **options):
        self.import_data('data/episode-characters.csv')

    def import_data(self, file_path):
        with open(file_path, 'r', newline='', encoding='utf-8') as file:
            reader = csv.reader(file)
            for row in reader:
                episode_title = row[0].strip()

                episode_number = row[1].strip()

                episode_release_date = row[2].strip() #release dates begin and end with quotes by default

                guest_names = [name.strip() for name in row[3:23] if name.strip()]  # Skip empty entries, 4th column is the start of the guests and they go through the 22nd column
                print(f"Guests: {guest_names}")
                character_names = [name.strip() for name in row[23:] if name.strip()]
                print(f"Characters: {character_names}")

                # Create or get the episode
                episode, created = Episode.objects.get_or_create(title=episode_title)

                if created:  # If the episode is newly created, then set its number and release_date
                    episode.number = episode_number
                    episode.release_date = episode_release_date
                    episode.save()  # Save the changes to the episode

                # Iterate over character names and create or get character
                for character_name in character_names:
                    character, _ = Character.objects.get_or_create(name=character_name)
                    # Add this character to the episode
                    episode.characters.add(character)

                for guest_name in guest_names:
                    guest, _ = Guest.objects.get_or_create(name=guest_name)
                    # Add the guest to the episode
                    episode.guests.add(guest)

                self.stdout.write(self.style.SUCCESS(f'Imported "{episode_title}" with characters: {", ".join(character_names)}, guests: {", ".join(guest_names)}, release date: {episode_release_date}, and number: {episode_number}'))