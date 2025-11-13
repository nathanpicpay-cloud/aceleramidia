
import React from 'react';

const services = [
  { name: "Criação de Sites", desc: "Sites institucionais modernos, rápidos e otimizados para SEO." },
  { name: "Landing Pages", desc: "Páginas de conversão de alto desempenho para campanhas de marketing." },
  { name: "E-commerce", desc: "Lojas virtuais completas com design estratégico e integração de pagamentos." },
  { name: "Sistemas Personalizados", desc: "Desenvolvimento sob medida para automatizar processos e aumentar resultados." },
  { name: "Identidade Visual", desc: "Criação de logotipos e guias de marca com identidade profissional." },
  { name: "Marketing Digital", desc: "Estratégias completas para alavancar sua presença online e gerar leads." }
];

const ServiceCard: React.FC<{ name: string; desc: string; index: number }> = ({ name, desc, index }) => {
  return (
    <div className="group relative p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden transition-all duration-300 hover:border-[#FF007F] hover:-translate-y-2">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-transparent to-[#FF007F]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <h3 className="text-2xl font-bold font-manrope text-white">{name}</h3>
        <p className="mt-4 text-zinc-400">{desc}</p>
      </div>
    </div>
  );
};

const ServicesSection: React.FC = () => {
  return (
    <section id="servicos" className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute -top-16 -left-16 w-80 h-80 bg-gradient-to-br from-[#FF007F] to-purple-600 rounded-full blur-[120px] opacity-10 -z-10"></div>
      <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-gradient-to-tl from-pink-500 to-rose-600 rounded-full blur-[120px] opacity-10 -z-10"></div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-manrope font-extrabold mb-4">
          Nossos <span className="text-[#FF007F]">Serviços</span>
        </h2>
        <p className="max-w-2xl mx-auto text-zinc-400 mb-16">
          Soluções digitais completas para impulsionar o seu negócio.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {services.map((service, index) => (
            <ServiceCard key={service.name} {...service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
