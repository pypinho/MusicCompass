
const { driver } = require('../../config/db');

const getGenres = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (n:Genre) RETURN n');
    const genres = result.records.map(record => record.get('n').properties);
    res.json(genres);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching genres');
  } finally {
    await session.close();
  }
};

const getGenreById = async (req, res) => {
  const session = driver.session();
  const { id } = req.params;
  try {
    const result = await session.run('MATCH (n:Genre {id: $id}) RETURN n', { id });
    if (result.records.length === 0) {
      return res.status(404).send('Genre not found');
    }
    const genre = result.records[0].get('n').properties;
    res.json(genre);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching genre');
  } finally {
    await session.close();
  }
};

module.exports = { getGenres, getGenreById };
