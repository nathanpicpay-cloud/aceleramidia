
import React, { useState } from 'react';

interface LoginModalProps {
  onClose: () => void;
  onLoginSubmit: (password: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSubmit }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSubmit(password);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-sm">
        <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Admin Login</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FF007F] focus:border-[#FF007F] transition-all duration-300 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#FF007F] text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-opacity-80 transition-all duration-300 shadow-[0_0_15px_rgba(255,0,127,0.5)]"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
