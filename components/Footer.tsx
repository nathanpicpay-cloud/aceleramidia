
import React from 'react';

interface FooterProps {
  isAdmin: boolean;
  onAdminLoginClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ isAdmin, onAdminLoginClick }) => {
  return (
    <footer className="bg-zinc-900/30 border-t border-zinc-800">
      <div className="container mx-auto px-6 py-8 text-center text-zinc-500">
        <p className="mb-4 text-sm">
          &copy; 2025 Acelera Mídia. Todos os direitos reservados.
        </p>
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" className="text-xs hover:text-white transition-colors">Termos de Uso</a>
          <a href="#" className="text-xs hover:text-white transition-colors">Política de Privacidade</a>
        </div>
        <button
          onClick={onAdminLoginClick}
          className="bg-zinc-800 text-zinc-400 font-bold py-2 px-6 rounded-full text-xs hover:bg-zinc-700 hover:text-white transition-all duration-300"
        >
          {isAdmin ? 'Painel do Administrador' : 'ADMIN'}
        </button>
      </div>
    </footer>
  );
};

export default Footer;
