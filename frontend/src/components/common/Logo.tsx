import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center group shrink-0">
      <img
        src={logoImg}
        alt="Civil Digital Store Logo"
        className="h-10 md:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
      />
    </Link>
  );
};

export default Logo;
