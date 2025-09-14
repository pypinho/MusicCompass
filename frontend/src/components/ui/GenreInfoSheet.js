
import React from 'react';

const GenreInfoSheet = ({ genre }) => {
  if (!genre) return null;

  return (
    <div className="info-sheet">
      <h2>{genre.name}</h2>
      <p>{genre.description}</p>
    </div>
  );
};

export default GenreInfoSheet;
