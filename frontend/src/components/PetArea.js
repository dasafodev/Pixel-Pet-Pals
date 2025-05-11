import React from 'react';

function PetArea() {
  return (
    <div className="pet-area">
      <img src={`${process.env.PUBLIC_URL}/wood_floor.png`} className="floor" alt="floor" />
      <img src={`${process.env.PUBLIC_URL}/cat.png`} className="cat" alt="pixel cat" />
    </div>
  );
}

export default PetArea;
