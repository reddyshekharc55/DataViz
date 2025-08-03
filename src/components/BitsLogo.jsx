import React from 'react';
import bitsLogo from '../assets/bits_logo.png';

const BitsLogo = () => (
  <img 
    src={bitsLogo} 
    alt="BITS Logo" 
    style={{
      height: '48px',
      width: 'auto',
      maxWidth: '120px',
      objectFit: 'contain',
      display: 'block',
    }}
  />
);

export default BitsLogo;
