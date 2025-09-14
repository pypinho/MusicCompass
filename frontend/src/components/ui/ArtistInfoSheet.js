
import React from 'react';

const ArtistInfoSheet = ({ artist }) => {
  if (!artist) return null;

  return (
    <div className="info-sheet">
      <h2>{artist.name}</h2>
      <p>{artist.description}</p>
    </div>
  );
};

export default ArtistInfoSheet;
