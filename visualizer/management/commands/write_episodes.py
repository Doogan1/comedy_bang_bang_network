from django.core.management.base import BaseCommand
import requests
import re
import csv
from tqdm import tqdm
from bs4 import BeautifulSoup
from django.conf import settings
import html
from urllib.parse import unquote

class Command(BaseCommand):
    help = 'Imports episode data from the Comedy Bang Bang Wiki'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data import...'))
        self.import_episodes()

    def import_episodes(self):
        url = "https://comedybangbang.fandom.com/wiki/Category:Episodes"
        response = requests.get(url)
        html_content = response.text

        soup = BeautifulSoup(html_content, 'html.parser')

        # Regex to extract "Episode X" where X is one or more digits
        episode_pattern = re.compile(r'Episode (\d+)')

        episodes_info = []
        lightbox_captions = soup.find_all('div', class_='lightbox-caption')
        for div in lightbox_captions:
            anchor = div.find('a')
            match = episode_pattern.search(anchor.get_text())
            episode = {
                'href': anchor['href'],
                'title': unquote(html.unescape(anchor['title'])),
                'number': match.group(1) if match else "Best Of",
                'guests': [],
                'characters': [],
                'release_date': ''}
            episodes_info.append(episode)

        test_episodes = episodes_info[:30]
        # Fetch episode details
        for episode in tqdm(episodes_info, desc="Fetching episode details"):
            episode_url = f"https://comedybangbang.fandom.com{episode['href']}"
            episode_details = self.fetch_episode_details(episode_url)
            episode.update(episode_details)

        # Write details to CSV
        self.write_to_csv(episodes_info)

    def fetch_episode_details(self, episode_url):
        regex_get_guest_list = r'<th>\s*Guests\s*<\/th>\s*<td>(.*?)\n<\/td>'
        regex_get_guest_names_from_guest_list = r'title="([^"]+)">'
        regex_get_release_date = r'Release date\n<\/th>\n<td>(.*)\n'
        regex_get_character_list = r'<th>\s*Characters\s*<\/th>\s*<td>(.*?)\n<\/td>'
        regex_get_character_names_from_character_list = r'title="([^"\(]+)'

        episode_details = {}
        response = requests.get(episode_url)
        print(f"Fetching Episode Details for {episode_url}")
        if response.status_code == 200:
            html_content = response.text

            # Find the section with guests
            guests_match = re.search(regex_get_guest_list, html_content, re.DOTALL)
            if guests_match:
                guests_html = guests_match.group(1)
                # Extract names within the guest HTML section
                guest_names = re.findall(regex_get_guest_names_from_guest_list, guests_html)
                print(f"Guest Names: {guest_names}")
                cleaned_guest_names = [unquote(html.unescape(guest_name)) for guest_name in guest_names]
                episode_details['guests'] = cleaned_guest_names
            
            #Find the section with characters
            characters_match = re.search(regex_get_character_list, html_content, re.DOTALL)
            if characters_match:
                characters_html = characters_match.group(1)
                #Extract character names within the characters HTML section
                character_names = re.findall(regex_get_character_names_from_character_list, characters_html)
                cleaned_character_names = [unquote(html.unescape(name.strip())) for name in character_names]
                print(f"Characters: {cleaned_character_names}")
                episode_details['characters'] = cleaned_character_names
            #Find the Release Date
            release_date_match = re.search(regex_get_release_date, html_content)
            if release_date_match:
                episode_details['release_date'] = unquote(html.unescape(release_date_match.group(1)))
            else:
                episode_details['release_date'] = ''
        return episode_details

    def write_to_csv(self, episode_info):
        # Determine the maximum number of guests in any episode for the CSV header
        max_guests = max(len(episode['guests']) for episode in episode_info)
        max_characters = max(len(episode['characters']) for episode in episode_info)

        # Create CSV header
        header = ['Title', 'Episode Number'] + [f'Guest {i+1}' for i in range(max_guests)] + [f'Character {i+1}' for i in range(max_characters)]

        # Writing to CSV
        with open('episode-characters_TEST.csv', 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(header)

            for episode in episode_info:
                # Create row with title, episode number, and guests
                row = [episode['title'], episode['number'], episode['release_date']] + episode['guests']
                # If the number of guests is less than max, fill the remaining guest cells with empty strings
                row += [''] * (max_guests - len(episode['guests']))
                #add characters to row
                row += episode['characters']
                #If the number of characters is less than the max, fill the remaining character cells with empty strings
                row += [''] * (max_characters - len(episode['characters']))
                writer.writerow(row)

        print("CSV file has been created successfully.")
        pass

    def add_arguments(self, parser):
        # You can add command line arguments here if needed
        pass

    