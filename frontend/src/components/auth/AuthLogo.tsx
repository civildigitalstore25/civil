import React from 'react';
import { Link } from 'react-router-dom';
import logoWhite from '../../assets/logo_white_text.png';
import logoDark from '../../assets/logo.png';

interface AuthLogoProps {
  variant?: 'white' | 'dark';
  className?: string;
}

export const AuthLogo: React.FC<AuthLogoProps> = ({ variant = 'white', className = '' }) => {
  const logoSrc = variant === 'white' ? logoWhite : logoDark;

  return (
    <Link to="/" className={`inline-block group ${className}`}>
      <img
        src={logoSrc}
        alt="Civil Digital Store Logo"
        className="h-9 sm:h-10 md:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
      />
    </Link>
  );
};

export default AuthLogo;
