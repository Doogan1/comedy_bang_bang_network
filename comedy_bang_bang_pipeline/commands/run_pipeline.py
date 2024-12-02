from django.core.management.base import BaseCommand
from pipelines.comedy_bang_bang import build_pipeline

class Command(BaseCommand):
    help = "Runs the Comedy Bang Bang data pipeline."

    def add_arguments(self, parser):
        parser.add_argument('--update', action='store_true', help='Run incremental update')

    def handle(self, *args, **options):
        pipeline = build_pipeline()

        if options['update']:
            self.stdout.write(self.style.SUCCESS("Running pipeline in update mode..."))
            # Modify pipeline steps or add specific logic for update mode
        else:
            self.stdout.write(self.style.SUCCESS("Running full pipeline..."))

        pipeline.execute()
