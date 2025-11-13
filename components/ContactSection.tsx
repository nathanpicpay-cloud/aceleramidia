
import React from 'react';
import { Instagram, Linkedin, Dribbble } from './Icons';

const ContactSection: React.FC = () => {
  return (
    <section id="contato" className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-[#FF007F] to-purple-600 rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-pink-500 to-rose-600 rounded-full blur-[120px] opacity-10"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-manrope font-extrabold mb-4">
            Entre em <span className="text-[#FF007F]">Contato</span>
          </h2>
          <p className="max-w-2xl mx-auto text-zinc-400 mb-12">
            Quer transformar sua presença digital? Fale conosco e descubra como podemos acelerar sua marca!
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/30">
          <form>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="name" className="sr-only">Nome</label>
                <input type="text" id="name" placeholder="Seu nome" className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FF007F] focus:border-[#FF007F] transition-all duration-300 outline-none" />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">E-mail</label>
                <input type="email" id="email" placeholder="Seu e-mail" className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FF007F] focus:border-[#FF007F] transition-all duration-300 outline-none" />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">Mensagem</label>
                <textarea id="message" placeholder="Sua mensagem" rows={5} className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FF007F] focus:border-[#FF007F] transition-all duration-300 outline-none"></textarea>
              </div>
              <div>
                <button type="submit" className="w-full bg-[#FF007F] text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-opacity-80 transition-all duration-300 shadow-[0_0_15px_rgba(255,0,127,0.5)]">
                  Enviar Mensagem
                </button>
              </div>
            </div>
          </form>
        </div>
        
        <div className="mt-16 text-center">
            <p className="text-zinc-400 mb-4">Ou agende uma reunião gratuita</p>
            <div className="flex justify-center space-x-6">
                <a href="#" className="text-zinc-500 hover:text-[#FF007F] transition-colors"><Instagram /></a>
                <a href="#" className="text-zinc-500 hover:text-[#FF007F] transition-colors"><Linkedin /></a>
                <a href="#" className="text-zinc-500 hover:text-[#FF007F] transition-colors"><Dribbble /></a>
            </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;