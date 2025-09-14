
import scrapy
from scrapy.crawler import CrawlerProcess
from scraper import MetalArchivesSpider

if __name__ == "__main__":
    process = CrawlerProcess(settings={
        "FEEDS": {
            "metal_bands.json": {"format": "json"},
        },
        "CLOSESPIDER_ITEMCOUNT": 100,
    })

    process.crawl(MetalArchivesSpider)
    process.start()
