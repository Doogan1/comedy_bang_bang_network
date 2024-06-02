import csv
import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from visualizer.models import Guest

class Command(BaseCommand):
    help = 'Scrape character-actor data and write to CSV'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting to scrape character-actor data...'))
        
        # Fetch guest names using Django ORM
        guest_names = Guest.objects.values_list('name', flat=True)
        
        # Scrape character-actor data
        character_actors = self.scrape_character_actor_data(guest_names)
        
        # Write the data to CSV
        self.write_character_actors_to_csv(character_actors)
        
        self.stdout.write(self.style.SUCCESS('Successfully scraped and wrote character-actor data to CSV.'))

    def scrape_character_actor_data(self, guest_names):
        base_url = "https://comedybangbang.fandom.com/wiki/"
        character_actors = []

        for name in guest_names:
            self.stdout.write(f'Processing guest: {name}')
            url = base_url + name.replace(' ', '_')
            response = requests.get(url)
            soup = BeautifulSoup(response.content, 'html.parser')

            character_names = []
            
            # Find the correct tr element based on the th element text content
            character_row = None
            for tr in soup.select('#mw-content-text > div > table:nth-of-type(1) > tbody > tr'):
                th = tr.select_one('th')
                if th and th.get_text(strip=True) == "Characters":
                    character_row = tr
                    break

            if character_row:
                # Extract the first name
                first_name_element = character_row.select_one('td > a')
                if first_name_element:
                    character_name = first_name_element.get_text(strip=True)
                    character_names.append(character_name)
                    self.stdout.write(f'Found character: {character_name}')
                
                # Extract all anchor elements within the td, including those in p elements
                all_name_elements = character_row.select('td a, td span')
                for element in all_name_elements:
                    character_name = element.get_text(strip=True)
                    if character_name not in character_names:
                        character_names.append(character_name)
                        self.stdout.write(f'Found character: {character_name}')
            
            # If no actor names were found, skip this guest
            if not character_names:
                self.stdout.write(f'No characters found for guest: {name}')
                continue

            for character_name in character_names:
                character_actors.append((name, character_name))

        return character_actors

    def write_character_actors_to_csv(self, character_actors):
        csv_path = 'character-actor.csv'
        with open(csv_path, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['Guest', 'Character'])  # Writing header
            for actor, character in character_actors:
                writer.writerow([actor, character])
                self.stdout.write(f'Added character-actor pair: {actor} - {character}')

if __name__ == '__main__':
    guest_names = get_guest_names()
    character_actors = scrape_character_actor_data(guest_names)
    write_character_actors_to_csv(character_actors)
