import React from 'react';
import bitsLogo from '../assets/bits_logo.png';

const BitsLogo = () => (
  <img 
    src={bitsLogo} 
    alt="BITS Logo" 
    style={{
      height: '70px',
      width: 'auto',
      maxWidth: '220px',
      objectFit: 'contain',
      display: 'block',
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 4px 18px 0 rgba(0, 151, 167, 0.13)',
      border: '2px solid #e0eafc',
      padding: '8px 18px',
      margin: '0 auto',
    }}
  />
);

export default BitsLogo;
