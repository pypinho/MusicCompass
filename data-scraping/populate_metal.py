import json
from neo4j import GraphDatabase

class Neo4jConnection:

    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def clear_db(self):
        with self.driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")

    def _create_genre_hierarchy(self, tx, genre_hierarchy):
        for genre, data in genre_hierarchy.items():
            tx.run("MERGE (g:Genre {name: $genre})", genre=genre)
            for subgenre in data.get('subgenres', []):
                tx.run("MERGE (sg:SubGenre {name: $subgenre})", subgenre=subgenre)
                tx.run("MATCH (g:Genre {name: $genre}) "
                       "MATCH (sg:SubGenre {name: $subgenre}) "
                       "MERGE (sg)-[:IS_SUBGENRE_OF]->(g)", 
                       genre=genre, subgenre=subgenre)

    def _create_and_link_artist(self, tx, name, tags, origin):
        # Find which of the artist's tags are in our subgenre list
        subgenres_for_artist = [tag for tag in tags if any(tag in v['subgenres'] for k, v in genre_hierarchy.items())]

        if not subgenres_for_artist:
            return # Don't create artists that don't belong to a subgenre

        query = (
            "CREATE (a:Artist {name: $name, origin: $origin}) "
            "WITH a "
            "UNWIND $subgenres AS subgenre_name "
            "MATCH (sg:SubGenre {name: subgenre_name}) "
            "CREATE (a)-[:BELONGS_TO]->(sg)"
        )
        tx.run(query, name=name, subgenres=subgenres_for_artist, origin=origin)

    def populate_data(self, data, genre_hierarchy):
        with self.driver.session() as session:
            session.write_transaction(self._create_genre_hierarchy, genre_hierarchy)
            for item in data:
                name = item.get('name')
                tags = item.get('tags', [])
                origin = item.get('country')
                
                if name:
                    self._create_and_link_artist(session, name, tags, origin)

if __name__ == "__main__":
    # Load the genre hierarchy
    with open('/home/pypinho/MusicCompass/data-scraping/genre_hierarchy.json') as f:
        genre_hierarchy = json.load(f)

    # Use the correct scraped file
    with open('/home/pypinho/MusicCompass/data-scraping/musicbrainz_metal_bands_1000.json') as f:
        data = json.load(f)

    conn = Neo4jConnection("bolt://localhost:7687", "neo4j", "password")
    conn.clear_db()
    conn.populate_data(data, genre_hierarchy)
    conn.close()