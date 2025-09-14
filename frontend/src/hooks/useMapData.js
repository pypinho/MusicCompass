
import { useState, useEffect } from 'react';
import { getGenres, getArtists } from '../services/api';

const useMapData = () => {
  const [data, setData] = useState({ genres: [], artists: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        const [genresRes, artistsRes] = await Promise.all([
          getGenres(),
          getArtists(),
        ]);
        console.log('Data fetched successfully:', { genresRes, artistsRes });
        setData({ genres: genresRes.data, artists: artistsRes.data });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export default useMapData;
