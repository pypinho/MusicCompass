
const { driver } = require('../../config/db');

const getArtists = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (a:Artist)-[:BELONGS_TO]->(g:Genre)
      RETURN a, COLLECT(g.name) AS genres
      `
    );
    const artists = result.records.map(record => {
      const artist = record.get('a').properties;
      artist.genres = record.get('genres'); // Add genres array to artist object
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

const getArtistById = async (req, res) => {
  const session = driver.session();
  const { id } = req.params;
  try {
    const result = await session.run('MATCH (n:Artist {id: $id}) RETURN n', { id });
    if (result.records.length === 0) {
      return res.status(404).send('Artist not found');
    }
    const artist = result.records[0].get('n').properties;
    res.json(artist);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching artist');
  } finally {
    await session.close();
  }
};

module.exports = { getArtists, getArtistById };
