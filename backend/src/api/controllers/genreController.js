
const { driver } = require('../../config/db');

const getGenres = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      'MATCH (g:Genre)<-[:IS_SUBGENRE_OF]-(sg:SubGenre) RETURN g.name AS genre, COLLECT(sg.name) AS subgenres'
    );
    const genreHierarchy = result.records.reduce((acc, record) => {
      acc[record.get('genre')] = { subgenres: record.get('subgenres') };
      return acc;
    }, {});
    res.json(genreHierarchy);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching genres');
  } finally {
    await session.close();
  }
};

module.exports = { getGenres };
