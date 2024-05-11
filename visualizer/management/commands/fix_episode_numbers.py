from django.core.management.base import BaseCommand
from visualizer.models import Episode

class Command(BaseCommand):
    help = 'Truncates episode numbers to three digits if they are too long and do not contain a decimal point'

    def handle(self, *args, **options):
        episodes = Episode.objects.filter(number__regex=r'^\d{4,}$')
        for episode in episodes:
            new_number = episode.number[:3]  # Truncate to first three digits
            episode.number = new_number
            episode.save()
            self.stdout.write(self.style.SUCCESS(f'Updated episode {episode.title} number to {new_number}'))
