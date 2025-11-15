
import React from 'react';

const Footer: React.FC = () => {
  const appVersion = "1.0.1"; // Version bump to trigger deployment

  return (
    <footer className="border-t border-zinc-800">
      <div className="container mx-auto px-6 py-8 text-center text-zinc-500">
        <p className="mb-4 text-sm">
          &copy; 2025 Acelera Mídia. Todos os direitos reservados. (v{appVersion})
        </p>
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" className="text-xs hover:text-white transition-colors">Termos de Uso</a>
          <a href="#" className="text-xs hover:text-white transition-colors">Política de Privacidade</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
