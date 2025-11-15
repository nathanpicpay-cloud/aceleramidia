
import React, { useState } from 'react';
import SparklesBackground from '../components/SparklesBackground';

interface LoginPageProps {
  onLoginSubmit: (password: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSubmit }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSubmit(password);
  };

  return (
    <div className="relative bg-black text-white min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-[#FF007F] rounded-full blur-[200px] opacity-10"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-600 rounded-full blur-[200px] opacity-10"></div>
        </div>
        <SparklesBackground className="fixed inset-0 z-0" />

      <div className="relative z-10 bg-zinc-900/50 border border-zinc-800 rounded-lg w-full max-w-sm backdrop-blur-lg">
        <div className="p-6 border-b border-zinc-800 flex flex-col items-center text-center">
          <img src="https://i.imgur.com/p6rDq9M.png" alt="Acelera Mídia Logo" className="h-8 w-auto mb-2" />
          <h2 className="text-xl font-bold">Admin Login</h2>
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
            <div className="text-center mt-6">
                <a href="/#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    &larr; Back to Acelera Mídia
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
