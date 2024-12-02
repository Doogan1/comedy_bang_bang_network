from base_pipeline import Pipeline
from scrapers import Scraper
from processors import CleanData
from importers import ImportEpisodes
from network_generators import GenerateNetworkData

def build_pipeline():
    pipeline = Pipeline("Comedy Bang Bang Pipeline")

    # Add scraping steps
    pipeline.add_step(Scraper(name="Fetch Episode List", url="https://comedybangbang.fandom.com/wiki/Category:Episodes", parser="HTML", output_format="csv"))
    pipeline.add_step(Scraper(name="Fetch Episode Details", url="https://comedybangbang.fandom.com", parser="HTML", output_format="json"))

    # Add processing steps
    pipeline.add_step(ImportEpisodes())
    pipeline.add_step(CleanData())

    # Add network generation
    pipeline.add_step(GenerateNetworkData(entity_type="characters"))
    pipeline.add_step(GenerateNetworkData(entity_type="guests"))

    return pipeline
