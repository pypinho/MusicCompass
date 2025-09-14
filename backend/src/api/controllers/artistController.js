
const { driver } = require('../../config/db');

const getArtists = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (a:Artist)-[:BELONGS_TO]->(sg:SubGenre)
      RETURN a, COLLECT(sg.name) AS subgenres
      `
    );
    const artists = result.records.map(record => {
      const artist = record.get('a').properties;
      artist.subgenres = record.get('subgenres'); // Add subgenres array to artist object
      return artist;
    });
    res.json(artists);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching artists');
  } finally {
    await session.close();
  }
};

module.exports = { getArtists };
