import React from 'react';
import bitsLogo from '../assets/bits_logo.png';

const BitsLogo = () => (
  <>
    <style>{`
      .bits-logo {
        height: 70px;
        width: auto;
        max-width: 220px;
        object-fit: contain;
        display: block;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 4px 18px 0 rgba(0, 151, 167, 0.13);
        border: 2px solid #e0eafc;
        padding: 8px 18px;
        margin: 0 auto;
      }
      
      @media (max-width: 768px) {
        .bits-logo {
          height: 50px;
          max-width: 160px;
          padding: 6px 12px;
          border-radius: 12px;
        }
      }
      
      @media (max-width: 480px) {
        .bits-logo {
          height: 40px;
          max-width: 120px;
          padding: 4px 8px;
          border-radius: 8px;
          border-width: 1px;
        }
      }
    `}</style>
    <img 
      src={bitsLogo} 
      alt="BITS Logo" 
      className="bits-logo"
    />
  </>
);

export default BitsLogo;
