from django.core.management.base import BaseCommand
from visualizer.models import CharacterComponent, GuestComponent
from django.db.models import Count

class Command(BaseCommand):
    help = 'Clean up duplicate CharacterComponent and GuestComponent objects'

    def handle(self, *args, **kwargs):
        self.clean_duplicates(CharacterComponent)
        self.clean_duplicates(GuestComponent)

    def clean_duplicates(self, model):
        duplicates = model.objects.values('name').annotate(name_count=Count('name')).filter(name_count__gt=1)
        for duplicate in duplicates:
            instances = model.objects.filter(name=duplicate['name'])
            primary_instance = instances.first()
            for instance in instances[1:]:
                instance.delete()
            self.stdout.write(self.style.SUCCESS(f'Cleaned up duplicates for component: {duplicate["name"]}'))
