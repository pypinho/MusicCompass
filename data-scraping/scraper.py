
import scrapy

class MetalArchivesSpider(scrapy.Spider):
    name = 'metal-archives'
    start_urls = ['https://www.metal-archives.com/browse/letter']

    def parse(self, response):
        # Find all the links to the letter pages
        for link in response.css('div.browse_letters a'):
            yield response.follow(link, self.parse_letter)

    def parse_letter(self, response):
        # Find all the links to the band pages
        for link in response.css('table.display.table_bands a'):
            yield response.follow(link, self.parse_band)

    def parse_band(self, response):
        # Extract data from the band's page
        name = response.css('h1.band_name a::text').get()
        country = response.css('#band_stats dd:nth-of-type(1) a::text').get()
        status = response.css('#band_stats dd:nth-of-type(2)::text').get()
        location = response.css('#band_stats dd:nth-of-type(3)::text').get()
        genre = response.css('#band_stats dd:nth-of-type(4)::text').get()
        themes = response.css('#band_stats dd:nth-of-type(5)::text').get()
        label = response.css('#band_stats dd:nth-of-type(6)::text').get()
        formation_date = response.css('#band_stats dd:nth-of-type(7)::text').get()

        yield {
            'name': name,
            'country': country,
            'status': status,
            'location': location,
            'genre': genre,
            'themes': themes,
            'label': label,
            'formation_date': formation_date,
            'url': response.url,
        }
