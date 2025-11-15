
import React from 'react';
import { Instagram, WhatsApp } from './Icons';

const ContactSection: React.FC = () => {
  return (
    <section id="contato" className="py-20 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-manrope font-extrabold mb-4">
            Entre em <span className="text-[#FF007F]">Contato</span>
          </h2>
          <p className="max-w-2xl mx-auto text-zinc-400 mb-12">
            Quer transformar sua presença digital? Fale conosco e descubra como podemos deixar a sua marca com identidade profissional!
          </p>
        </div>

        <div className="text-center">
             <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <a href="#" className="inline-flex items-center justify-center gap-3 bg-[#FF007F] text-white font-bold py-3 px-8 rounded-full text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_25px_rgba(255,0,127,0.6)] w-full sm:w-auto">
                    <WhatsApp />
                    <span>WhatsApp</span>
                </a>
                <a href="#" className="inline-flex items-center justify-center gap-3 bg-[#FF007F] text-white font-bold py-3 px-8 rounded-full text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_25px_rgba(255,0,127,0.6)] w-full sm:w-auto">
                    <Instagram />
                    <span>Instagram</span>
                </a>
            </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
