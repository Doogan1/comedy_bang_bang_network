from django.core.management.base import BaseCommand
from visualizer.models import Character, Guest, Episode  # Make sure Episode is imported
from visualizer.utils import find_best_match

class Command(BaseCommand):
    help = 'Clean and validate character and guest data interactively'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Cleaning and validating data...'))

        # Load existing names for fuzzy matching
        existing_guests = list(Guest.objects.values_list('name', flat=True))
        existing_characters = list(Character.objects.values_list('name', flat=True))

        # Collect all guest matches
        guest_matches = []
        for guest in Guest.objects.all():
            other_guests = [name for name in existing_guests if name != guest.name]
            best_match = find_best_match(guest.name, other_guests)
            if best_match and best_match != guest.name:
                guest_matches.append((guest.name, best_match))

        # Collect all character matches
        character_matches = []
        for character in Character.objects.all():
            other_characters = [name for name in existing_characters if name != character.name]
            best_match = find_best_match(character.name, other_characters)
            if best_match and best_match != character.name:
                character_matches.append((character.name, best_match))

        # Remove duplicate pairs
        guest_matches = self.remove_duplicate_pairs(guest_matches)
        character_matches = self.remove_duplicate_pairs(character_matches)

        # Prompt user for merging guests
        for guest1, guest2 in guest_matches:
            self.stdout.write(self.style.WARNING(f'Guest {guest1} is similar to {guest2}.'))
            merge_choice = input(f"Do you want to merge '{guest1}' with '{guest2}'? (y/n): ").strip().lower()
            if merge_choice == 'y':
                merge_name = input(f"Which name do you want to keep? (1: {guest1}, 2: {guest2}): ").strip()
                if merge_name == '1':
                    self.merge_guests(guest1, guest2)
                elif merge_name == '2':
                    self.merge_guests(guest2, guest1)

        # Prompt user for merging characters
        for char1, char2 in character_matches:
            self.stdout.write(self.style.WARNING(f'Character {char1} is similar to {char2}.'))
            merge_choice = input(f"Do you want to merge '{char1}' with '{char2}'? (y/n): ").strip().lower()
            if merge_choice == 'y':
                merge_name = input(f"Which name do you want to keep? (1: {char1}, 2: {char2}): ").strip()
                if merge_name == '1':
                    self.merge_characters(char1, char2)
                elif merge_name == '2':
                    self.merge_characters(char2, char1)

        self.stdout.write(self.style.SUCCESS('Data cleaning and validation complete.'))

    def remove_duplicate_pairs(self, pairs):
        unique_pairs = set()
        for pair in pairs:
            sorted_pair = tuple(sorted(pair))
            unique_pairs.add(sorted_pair)
        return list(unique_pairs)

    def merge_guests(self, keep_name, merge_name):
        keep_guest = Guest.objects.get(name=keep_name)
        merge_guest = Guest.objects.get(name=merge_name)

        # Transfer any relationships from merge_guest to keep_guest
        for character in merge_guest.characters.all():
            character.guests.remove(merge_guest)
            character.guests.add(keep_guest)

        # Transfer any episodes from merge_guest to keep_guest
        for episode in merge_guest.episodes.all():
            episode.guests.remove(merge_guest)
            episode.guests.add(keep_guest)

        # Delete the merge_guest
        merge_guest.delete()
        self.stdout.write(self.style.SUCCESS(f'Merged guest {merge_name} into {keep_name}.'))

    def merge_characters(self, keep_name, merge_name):
        keep_character = Character.objects.get(name=keep_name)
        merge_character = Character.objects.get(name=merge_name)

        # Transfer any relationships from merge_character to keep_character
        for guest in merge_character.actors.all():
            merge_character.actors.remove(guest)
            keep_character.actors.add(guest)

        # Transfer any episodes from merge_character to keep_character
        for episode in merge_character.episodes.all():
            episode.characters.remove(merge_character)
            episode.characters.add(keep_character)

        # Delete the merge_character
        merge_character.delete()
        self.stdout.write(self.style.SUCCESS(f'Merged character {merge_name} into {keep_name}.'))
