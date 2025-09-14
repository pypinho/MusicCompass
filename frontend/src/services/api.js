
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getGenres = () => {
  return apiClient.get('/genres');
};

export const getArtists = () => {
  return apiClient.get('/artists');
};
