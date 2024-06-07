from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command

# Assuming one has already scraped the data by running write_episodes and write_actor_characters to save the data in a csv
# This takes the data from the csv to build the database
class Command(BaseCommand):
    help = 'Runs a sequence of management commands to setup the database.'

    def handle(self, *args, **options):
        commands = [
            'import_episodes',
            'clean_data',
            'connect_characters_guests',
            'fix_episode_numbers',
            'general_generate_network_data -t characters',
            'general_generate_network_data -t guests'
        ]
        
        for command in commands:
            try:
                self.stdout.write(self.style.SUCCESS(f'Running command: {command}'))
                command_name, *args = command.split()
                call_command(command_name, *args)
            except CommandError as e:
                self.stderr.write(self.style.ERROR(f'Error while running command {command}: {e}'))
                break
            self.stdout.write(self.style.SUCCESS(f'Successfully ran command: {command}'))

        self.stdout.write(self.style.SUCCESS('All commands ran successfully.'))
