import React from 'react';

export const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 13 }) => {
  const full = Math.round(rating);
  return (
    <span className="pv-stars" style={{ fontSize: size }}>
      {'★'.repeat(full)}
      {'☆'.repeat(5 - full)}
    </span>
  );
};
