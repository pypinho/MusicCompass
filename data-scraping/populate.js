
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

const session = driver.session();

const genres = [
  { id: '1', name: 'Rock' },
  { id: '2', name: 'Pop' },
  { id: '3', name: 'Jazz' },
];

const artists = [
  { id: '1', name: 'The Beatles', genreId: '1' },
  { id: '2', name: 'Michael Jackson', genreId: '2' },
  { id: '3', name: 'Miles Davis', genreId: '3' },
];

const populate = async () => {
  try {
    // Create genres
    for (const genre of genres) {
      await session.run('CREATE (n:Genre {id: $id, name: $name})', genre);
    }

    // Create artists and relationships
    for (const artist of artists) {
      await session.run(
        'MATCH (g:Genre {id: $genreId}) CREATE (a:Artist {id: $id, name: $name})-[:BELONGS_TO]->(g)',
        artist
      );
    }

    console.log('Database populated successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await session.close();
    await driver.close();
  }
};

populate();
