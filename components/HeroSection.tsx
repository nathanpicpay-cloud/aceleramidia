import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-screen flex justify-center items-center text-center overflow-hidden px-4">
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-manrope font-extrabold uppercase tracking-tighter">
           <img src="https://images.weserv.nl/?url=i.imgur.com/Pv3Xnec.png" alt="Acelera Mídia" className="mx-auto max-w-full h-auto w-[clamp(300px,80vw,600px)] drop-shadow-[0_0_20px_rgba(255,0,127,0.7)]" />
        </h1>
        <p className="mt-4 text-lg md:text-2xl text-zinc-300 max-w-2xl mx-auto">
          Transformamos ideias em <span className="text-white font-semibold">experiências digitais</span> incríveis.
        </p>
        <p className="mt-6 text-sm md:text-base text-zinc-400 max-w-xl mx-auto">
          Agência especializada em criação de sites profissionais, landing pages e sistemas personalizados. Criamos projetos com design inovador e performance otimizada.
        </p>
        <a href="#portfolio" className="mt-10 inline-block bg-[#FF007F] text-white font-bold py-3 px-8 rounded-full text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_25px_rgba(255,0,127,0.6)]">
          Ver Portfólio
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
