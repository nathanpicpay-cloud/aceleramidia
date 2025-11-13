
import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <section id="sobre" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-md">
            <h2 className="text-4xl md:text-5xl font-manrope font-extrabold">
              Quem <span className="text-[#FF007F]">Somos</span>
            </h2>
            <p className="mt-6 text-zinc-300 leading-relaxed">
              Somos uma agência de web design apaixonada por transformar marcas em experiências digitais impactantes. Unimos tecnologia, design e estratégia para entregar resultados reais aos nossos clientes.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-black">
                <img src="https://images.weserv.nl/?url=i.imgur.com/OG9NKwa.png" alt="Acelera Mídia Team" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
