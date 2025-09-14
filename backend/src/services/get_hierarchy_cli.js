
const { get_genre_hierarchy } = require('./geminiService');

// Get genres from command line arguments
const genres = process.argv.slice(2);

(async () => {
    const hierarchy = await get_genre_hierarchy(genres);
    console.log(JSON.stringify(hierarchy, null, 2));
})();
