import React from 'react';
import './Hero.css';
import hand_icon from '../Assets/hand_icon.png';
import arrow_icon from '../Assets/arrow.png';
import hero_image from '../Assets/hero_image.png';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className='hero'>
      <div className="hero-left">
        <h2>NEW ARRIVALS ONLY</h2>
        
        <div className="hero-hand-icon">
          <p>new</p>
          <img src={hand_icon} alt="Hand Icon" /> 
        </div>

        <p>Collection</p>
        <p>for everyone</p>

        <Link className="hero-latest-btn" to="/collection">
          <div>Latest Collection</div>
          <img src={arrow_icon} alt="Arrow Icon" />  
        </Link>
      </div>

      <div className="hero-right">
        <img src={hero_image} alt="Hero" />  
      </div>
    </div>
  );
}
