
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  isAdmin: boolean;
  onAdminClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAdmin, onAdminClick, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'sobre', label: 'Quem Somos' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'portfolio', label: 'Projetos' },
    { id: 'time', label: 'Time' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-lg border-b border-zinc-800' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 py-2 flex justify-center md:justify-between items-center">
        <a href="#hero" className="block">
          <img src="https://images.weserv.nl/?url=i.imgur.com/p6rDq9M.png" alt="Acelera Mídia Logo" className="h-8 w-auto drop-shadow-[0_0_10px_rgba(255,0,127,0.6)]" />
        </a>
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a key={link.id} href={`#${link.id}`} className="text-sm text-zinc-300 hover:text-white transition-colors duration-300">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center space-x-4">
          {isAdmin && (
            <>
              <button onClick={onAdminClick} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full text-sm hover:bg-opacity-80 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                Painel Admin
              </button>
               <button onClick={onLogout} className="text-zinc-400 hover:text-white text-sm">Sair</button>
            </>
          )}
          <a href="#contato" className="inline-block bg-[#FF007F] text-white font-bold py-2 px-6 rounded-full text-sm hover:bg-opacity-80 transition-all duration-300 shadow-[0_0_15px_rgba(255,0,127,0.5)]">
            Contato
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
