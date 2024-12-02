from base_pipeline import PipelineStep

class Scraper(PipelineStep):
    def __init__(self, name, url, parser, output_format):
        self.name = name
        self.url = url
        self.parser = parser
        self.output_format = output_format

    def execute(self, context):
        print(f"Running scraper: {self.name}")
        # Scraping logic here
