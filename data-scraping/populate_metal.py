
import json
from neo4j import GraphDatabase

class Neo4jConnection:

    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def _create_and_link_nodes(self, tx, name, genres, origin):
        query = (
            "CREATE (a:Artist {name: $name, origin: $origin}) "
            "WITH a "
            "UNWIND $genres AS genre_name "
            "MERGE (g:Genre {name: genre_name}) "
            "CREATE (a)-[:BELONGS_TO]->(g)"
        )
        tx.run(query, name=name, genres=genres, origin=origin)

    def populate_data(self, data):
        with self.driver.session() as session:
            for item in data:
                name = item.get('name')
                genres = item.get('tags', []) # Map 'tags' from scraper to 'genres'
                origin = item.get('country') # Map 'country' from scraper to 'origin'
                
                if name:
                    session.write_transaction(self._create_and_link_nodes, name, genres, origin)

if __name__ == "__main__":
    # Use the correct scraped file
    with open('/home/pypinho/MusicCompass/data-scraping/musicbrainz_metal_bands_1000.json') as f:
        data = json.load(f)

    conn = Neo4jConnection("bolt://localhost:7687", "neo4j", "password")
    conn.populate_data(data)
    conn.close()
