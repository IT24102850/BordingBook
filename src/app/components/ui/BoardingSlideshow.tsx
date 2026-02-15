import React, { useEffect, useState } from 'react';

const images = [
  
  
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80',
  
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80',
];

export const BoardingSlideshow: React.FC<{ className?: string }>= ({ className }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);
  return (
    <img
      src={images[idx]}
      alt="Boarding House"
      className={className || "rounded-3xl w-[420px] h-[540px] object-cover shadow-lift transition-all duration-700"}
      style={{transition: 'all 0.7s'}}
    />
  );
};

  